package com.thrddqno.motomate.service;

import com.thrddqno.motomate.dto.request.CreateServiceLogRequest;
import com.thrddqno.motomate.dto.response.PagedResponse;
import com.thrddqno.motomate.dto.response.ServiceLogResponse;
import com.thrddqno.motomate.entity.MaintenanceSchedule;
import com.thrddqno.motomate.entity.Motorcycle;
import com.thrddqno.motomate.entity.ServiceLog;
import com.thrddqno.motomate.exception.ResourceNotFoundException;
import com.thrddqno.motomate.repository.MaintenanceScheduleRepository;
import com.thrddqno.motomate.repository.MotorcycleRepository;
import com.thrddqno.motomate.repository.ServiceLogRepository;
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
        Page<ServiceLog> serviceLogPage = serviceLogRepository.findByMotorcycleIdAndUserIdWithFilter(
                motorcycleId, userId, templateName, pageable);

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
}
