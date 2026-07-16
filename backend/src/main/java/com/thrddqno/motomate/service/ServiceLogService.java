package com.thrddqno.motomate.service;

import com.thrddqno.motomate.dto.request.CreateServiceLogRequest;
import com.thrddqno.motomate.dto.response.CursorPageResponse;
import com.thrddqno.motomate.dto.response.PagedResponse;
import com.thrddqno.motomate.dto.response.ServiceLogResponse;
import com.thrddqno.motomate.entity.MaintenanceSchedule;
import com.thrddqno.motomate.entity.Motorcycle;
import com.thrddqno.motomate.entity.ServiceLog;
import com.thrddqno.motomate.exception.ResourceNotFoundException;
import com.thrddqno.motomate.repository.MaintenanceScheduleRepository;
import com.thrddqno.motomate.repository.MotorcycleRepository;
import com.thrddqno.motomate.repository.ServiceLogRepository;
import com.thrddqno.motomate.util.CursorCodec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ServiceLogService {

    private final ServiceLogRepository serviceLogRepository;
    private final MaintenanceScheduleRepository scheduleRepository;
    private final MotorcycleRepository motorcycleRepository;

    public List<ServiceLogResponse> getServiceLogsByMotorcycleId(UUID motorcycleId, UUID userId) {
        motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        return serviceLogRepository.findByMotorcycleId(motorcycleId).stream()
                .map(this::toResponse)
                .toList();
    }

    public PagedResponse<ServiceLogResponse> getServiceLogsPaginated(
            UUID motorcycleId, UUID userId, String templateName, int page, int size) {
        motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dateOfService"));
        String templatePattern = templatePattern(templateName);
        Page<ServiceLog> serviceLogPage = templatePattern == null
                ? serviceLogRepository.findByMotorcycleIdAndUserId(motorcycleId, userId, pageable)
                : serviceLogRepository.findByMotorcycleIdAndUserIdWithTemplateName(
                        motorcycleId, userId, templatePattern, pageable);

        List<ServiceLogResponse> content = serviceLogPage.getContent().stream()
                .map(this::toResponse)
                .toList();

        return PagedResponse.<ServiceLogResponse>builder()
                .content(content)
                .pageNumber(serviceLogPage.getNumber())
                .pageSize(serviceLogPage.getSize())
                .totalElements(serviceLogPage.getTotalElements())
                .totalPages(serviceLogPage.getTotalPages())
                .first(serviceLogPage.isFirst())
                .last(serviceLogPage.isLast())
                .build();
    }

    public CursorPageResponse<ServiceLogResponse> getServiceLogsKeyset(
            UUID motorcycleId, UUID userId, String templateName, String cursor, int size) {
        motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        int pageSize = normalizePageSize(size);
        List<ServiceLog> logs = findMotorcycleLogs(motorcycleId, userId, templateName, cursor, pageSize);

        return toCursorPage(logs, pageSize);
    }

    public CursorPageResponse<ServiceLogResponse> getUserServiceLogsKeyset(
            UUID userId, UUID motorcycleId, String templateName, String cursor, int size) {
        int pageSize = normalizePageSize(size);
        List<ServiceLog> logs = findUserLogs(userId, motorcycleId, templateName, cursor, pageSize);

        return toCursorPage(logs, pageSize);
    }

    public ServiceLogResponse getServiceLogById(UUID serviceLogId, UUID userId) {
        ServiceLog serviceLog = serviceLogRepository.findById(serviceLogId)
                .orElseThrow(() -> new ResourceNotFoundException("Service log not found"));

        if (!serviceLog.getMotorcycle().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Service log not found");
        }

        return toResponse(serviceLog);
    }

    @Transactional
    public ServiceLogResponse createServiceLog(UUID motorcycleId, CreateServiceLogRequest request, UUID userId) {
        Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        MaintenanceSchedule schedule = scheduleRepository.findById(request.getScheduleId())
                .filter(s -> s.getMotorcycle().getId().equals(motorcycleId))
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        ServiceLog serviceLog = ServiceLog.builder()
                .schedule(schedule)
                .motorcycle(motorcycle)
                .template(schedule.getTemplate())
                .mileageAtService(request.getMileageAtService())
                .dateOfService(request.getDateOfService())
                .cost(request.getCost())
                .notes(request.getNotes())
                .build();

        ServiceLog saved = serviceLogRepository.save(serviceLog);

        updateScheduleLastPerformed(schedule, request.getMileageAtService(), request.getDateOfService());

        return toResponse(saved);
    }

    private void updateScheduleLastPerformed(MaintenanceSchedule schedule, Integer mileage, LocalDate date) {
        schedule.setLastServiceMileage(mileage);
        schedule.setLastServiceDate(date);

        if (schedule.getIntervalType() == com.thrddqno.motomate.enums.IntervalType.MILEAGE ||
            schedule.getIntervalType() == com.thrddqno.motomate.enums.IntervalType.BOTH) {
            if (schedule.getIntervalMileage() != null) {
                schedule.setNextDueMileage(mileage + schedule.getIntervalMileage());
            }
        }

        if (schedule.getIntervalType() == com.thrddqno.motomate.enums.IntervalType.DATE ||
            schedule.getIntervalType() == com.thrddqno.motomate.enums.IntervalType.BOTH) {
            if (schedule.getIntervalDays() != null) {
                schedule.setNextDueDate(date.plusDays(schedule.getIntervalDays()));
            }
        }

        schedule.setUpdatedAt(Instant.now());
        scheduleRepository.save(schedule);
    }

    private ServiceLogResponse toResponse(ServiceLog serviceLog) {
        return ServiceLogResponse.builder()
                .id(serviceLog.getId())
                .scheduleId(serviceLog.getSchedule().getId())
                .motorcycleId(serviceLog.getMotorcycle().getId())
                .templateId(serviceLog.getTemplate().getId())
                .templateName(serviceLog.getTemplate().getName())
                .mileageAtService(serviceLog.getMileageAtService())
                .dateOfService(serviceLog.getDateOfService())
                .cost(serviceLog.getCost())
                .notes(serviceLog.getNotes())
                .createdAt(serviceLog.getCreatedAt())
                .build();
    }

    private CursorPageResponse<ServiceLogResponse> toCursorPage(List<ServiceLog> logs, int pageSize) {
        boolean hasMore = logs.size() > pageSize;
        List<ServiceLog> pageItems = hasMore ? logs.subList(0, pageSize) : logs;
        String nextCursor = hasMore ? CursorCodec.encode(pageItems.getLast().getCreatedAt()) : null;

        return CursorPageResponse.<ServiceLogResponse>builder()
                .content(pageItems.stream().map(this::toResponse).toList())
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .pageSize(pageSize)
                .build();
    }

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return 20;
        }
        return Math.min(size, 50);
    }

    private List<ServiceLog> findMotorcycleLogs(UUID motorcycleId, UUID userId, String templateName, String cursor, int pageSize) {
        Instant cursorCreatedAt = CursorCodec.decodeInstant(cursor);
        String templatePattern = templatePattern(templateName);
        PageRequest pageRequest = PageRequest.of(0, pageSize + 1);

        if (templatePattern == null && cursorCreatedAt == null) {
            return serviceLogRepository.findByMotorcycleIdKeyset(motorcycleId, userId, pageRequest);
        }

        if (templatePattern == null) {
            return serviceLogRepository.findByMotorcycleIdKeysetAfter(motorcycleId, userId, cursorCreatedAt, pageRequest);
        }

        if (cursorCreatedAt == null) {
            return serviceLogRepository.findByMotorcycleIdKeysetWithTemplateName(
                    motorcycleId, userId, templatePattern, pageRequest);
        }

        return serviceLogRepository.findByMotorcycleIdKeysetWithTemplateNameAfter(
                motorcycleId, userId, templatePattern, cursorCreatedAt, pageRequest);
    }

    private List<ServiceLog> findUserLogs(UUID userId, UUID motorcycleId, String templateName, String cursor, int pageSize) {
        Instant cursorCreatedAt = CursorCodec.decodeInstant(cursor);
        String templatePattern = templatePattern(templateName);
        PageRequest pageRequest = PageRequest.of(0, pageSize + 1);

        if (motorcycleId == null && templatePattern == null && cursorCreatedAt == null) {
            return serviceLogRepository.findByUserIdKeyset(userId, pageRequest);
        }

        if (motorcycleId != null && templatePattern == null && cursorCreatedAt == null) {
            return serviceLogRepository.findByUserIdAndMotorcycleIdKeyset(userId, motorcycleId, pageRequest);
        }

        if (motorcycleId == null && templatePattern != null && cursorCreatedAt == null) {
            return serviceLogRepository.findByUserIdKeysetWithTemplateName(userId, templatePattern, pageRequest);
        }

        if (motorcycleId != null && templatePattern != null && cursorCreatedAt == null) {
            return serviceLogRepository.findByUserIdAndMotorcycleIdKeysetWithTemplateName(
                    userId, motorcycleId, templatePattern, pageRequest);
        }

        if (motorcycleId == null && templatePattern == null) {
            return serviceLogRepository.findByUserIdKeysetAfter(userId, cursorCreatedAt, pageRequest);
        }

        if (motorcycleId != null && templatePattern == null) {
            return serviceLogRepository.findByUserIdAndMotorcycleIdKeysetAfter(
                    userId, motorcycleId, cursorCreatedAt, pageRequest);
        }

        if (motorcycleId == null) {
            return serviceLogRepository.findByUserIdKeysetWithTemplateNameAfter(
                    userId, templatePattern, cursorCreatedAt, pageRequest);
        }

        return serviceLogRepository.findByUserIdAndMotorcycleIdKeysetWithTemplateNameAfter(
                userId, motorcycleId, templatePattern, cursorCreatedAt, pageRequest);
    }

    private String templatePattern(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return "%" + value.toLowerCase(Locale.ROOT) + "%";
    }
}
