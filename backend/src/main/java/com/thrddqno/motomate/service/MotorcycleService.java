package com.thrddqno.motomate.service;

import com.thrddqno.motomate.dto.request.CreateMotorcycleRequest;
import com.thrddqno.motomate.dto.request.UpdateMotorcycleRequest;
import com.thrddqno.motomate.dto.response.CursorPageResponse;
import com.thrddqno.motomate.dto.response.MotorcycleDetailResponse;
import com.thrddqno.motomate.dto.response.MotorcycleResponse;
import com.thrddqno.motomate.dto.response.ScheduleResponse;
import com.thrddqno.motomate.dto.response.ServiceLogResponse;
import com.thrddqno.motomate.entity.MaintenanceSchedule;
import com.thrddqno.motomate.entity.MaintenanceTemplate;
import com.thrddqno.motomate.entity.Motorcycle;
import com.thrddqno.motomate.entity.ServiceLog;
import com.thrddqno.motomate.entity.User;
import com.thrddqno.motomate.enums.IntervalType;
import com.thrddqno.motomate.exception.ResourceNotFoundException;
import com.thrddqno.motomate.repository.MaintenanceScheduleRepository;
import com.thrddqno.motomate.repository.MaintenanceTemplateRepository;
import com.thrddqno.motomate.repository.MotorcycleRepository;
import com.thrddqno.motomate.repository.ServiceLogRepository;
import com.thrddqno.motomate.repository.UserRepository;
import com.thrddqno.motomate.util.CursorCodec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MotorcycleService {

    private final MotorcycleRepository motorcycleRepository;
    private final UserRepository userRepository;
    private final MaintenanceScheduleRepository scheduleRepository;
    private final ServiceLogRepository serviceLogRepository;
    private final MaintenanceTemplateRepository templateRepository;

    public List<MotorcycleResponse> getMotorcyclesByUserId(UUID userId) {
        return motorcycleRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CursorPageResponse<MotorcycleResponse> getMotorcyclesByUserId(UUID userId, String cursor, int size) {
        int pageSize = normalizePageSize(size);
        Instant cursorCreatedAt = CursorCodec.decodeInstant(cursor);
        PageRequest pageRequest = PageRequest.of(0, pageSize + 1);
        List<Motorcycle> motorcycles = cursorCreatedAt == null
                ? motorcycleRepository.findByUserIdKeyset(userId, pageRequest)
                : motorcycleRepository.findByUserIdKeysetAfter(userId, cursorCreatedAt, pageRequest);

        boolean hasMore = motorcycles.size() > pageSize;
        List<Motorcycle> pageItems = hasMore ? motorcycles.subList(0, pageSize) : motorcycles;
        String nextCursor = hasMore ? CursorCodec.encode(pageItems.getLast().getCreatedAt()) : null;

        return CursorPageResponse.<MotorcycleResponse>builder()
                .content(pageItems.stream().map(this::toResponse).toList())
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .pageSize(pageSize)
                .build();
    }

    public MotorcycleResponse getMotorcycleById(UUID motorcycleId, UUID userId) {
        Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));
        return toResponse(motorcycle);
    }

    public MotorcycleDetailResponse getMotorcycleDetail(UUID motorcycleId, UUID userId) {
        Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));
        
        List<MaintenanceSchedule> schedules = scheduleRepository.findByMotorcycleId(motorcycleId);
        List<ServiceLog> recentLogs = serviceLogRepository.findByMotorcycleId(motorcycleId).stream()
                .sorted((a, b) -> b.getDateOfService().compareTo(a.getDateOfService()))
                .limit(10)
                .toList();
        
        int overdueCount = 0;
        int dueSoonCount = 0;
        int upcomingCount = 0;
        
        for (MaintenanceSchedule schedule : schedules) {
            if (!schedule.getIsActive()) continue;
            
            boolean isOverdue = false;
            boolean isDueSoon = false;
            
            if (schedule.getIntervalType() == IntervalType.MILEAGE || 
                schedule.getIntervalType() == IntervalType.BOTH) {
                if (schedule.getNextDueMileage() != null && motorcycle.getCurrentMileage() != null) {
                    long remainingKm = schedule.getNextDueMileage() - motorcycle.getCurrentMileage();
                    if (remainingKm <= 0) {
                        isOverdue = true;
                    } else if (remainingKm <= schedule.getIntervalMileage() * 0.1) {
                        isDueSoon = true;
                    }
                }
            }
            
            if (schedule.getIntervalType() == IntervalType.DATE || 
                schedule.getIntervalType() == IntervalType.BOTH) {
                if (schedule.getNextDueDate() != null) {
                    long daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), schedule.getNextDueDate());
                    if (daysUntilDue <= 0) {
                        isOverdue = true;
                    } else if (daysUntilDue <= 7) {
                        isDueSoon = true;
                    }
                }
            }
            
            if (isOverdue) {
                overdueCount++;
            } else if (isDueSoon) {
                dueSoonCount++;
            } else {
                upcomingCount++;
            }
        }
        
        return MotorcycleDetailResponse.builder()
                .id(motorcycle.getId())
                .make(motorcycle.getMake())
                .model(motorcycle.getModel())
                .year(motorcycle.getYear())
                .licensePlate(motorcycle.getLicensePlate())
                .vin(motorcycle.getVin())
                .notes(motorcycle.getNotes())
                .currentMileage(motorcycle.getCurrentMileage())
                .isActive(motorcycle.getIsActive())
                .createdAt(motorcycle.getCreatedAt())
                .updatedAt(motorcycle.getUpdatedAt())
                .schedules(schedules.stream().map(this::toScheduleResponse).toList())
                .recentServiceLogs(recentLogs.stream().map(this::toServiceLogResponse).toList())
                .totalSchedules(schedules.size())
                .overdueCount(overdueCount)
                .dueSoonCount(dueSoonCount)
                .upcomingCount(upcomingCount)
                .build();
    }

    @Transactional
    public MotorcycleResponse createMotorcycle(CreateMotorcycleRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Motorcycle motorcycle = Motorcycle.builder()
                .user(user)
                .name(request.getName())
                .make(request.getMake())
                .model(request.getModel())
                .year(request.getYear())
                .licensePlate(request.getLicensePlate())
                .vin(request.getVin())
                .notes(request.getNotes())
                .currentMileage(request.getCurrentMileage())
                .initialMileage(request.getCurrentMileage())
                .isActive(true)
                .build();

        Motorcycle saved = motorcycleRepository.save(motorcycle);

        List<MaintenanceTemplate> templates;
        if (request.getTemplateIds() != null && !request.getTemplateIds().isEmpty()) {
            templates = templateRepository.findAllById(request.getTemplateIds());
        } else {
            templates = templateRepository.findByIsSystem(true);
        }

        Integer currentMileage = motorcycle.getCurrentMileage();
        LocalDate today = LocalDate.now();

        for (MaintenanceTemplate template : templates) {
            MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                    .motorcycle(motorcycle)
                    .template(template)
                    .intervalType(template.getDefaultIntervalMileage() != null && template.getDefaultIntervalDays() != null
                            ? IntervalType.BOTH
                            : template.getDefaultIntervalMileage() != null
                                    ? IntervalType.MILEAGE
                                    : IntervalType.DATE)
                    .intervalMileage(template.getDefaultIntervalMileage())
                    .intervalDays(template.getDefaultIntervalDays())
                    .lastServiceMileage(currentMileage)
                    .lastServiceDate(today)
                    .isActive(true)
                    .build();

            if (template.getDefaultIntervalMileage() != null) {
                schedule.setNextDueMileage(currentMileage + template.getDefaultIntervalMileage());
            }
            if (template.getDefaultIntervalDays() != null) {
                schedule.setNextDueDate(today.plusDays(template.getDefaultIntervalDays()));
            }

            scheduleRepository.save(schedule);
        }

        return toResponse(saved);
    }

    @Transactional
    public MotorcycleResponse updateMotorcycle(UUID motorcycleId, UpdateMotorcycleRequest request, UUID userId) {
        Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        motorcycle.setName(request.getName());
        motorcycle.setMake(request.getMake());
        motorcycle.setModel(request.getModel());
        motorcycle.setYear(request.getYear());
        motorcycle.setLicensePlate(request.getLicensePlate());
        motorcycle.setVin(request.getVin());
        motorcycle.setNotes(request.getNotes());

        if (request.getCurrentMileage() != null) {
            motorcycle.setCurrentMileage(request.getCurrentMileage());
        }

        if (request.getIsActive() != null) {
            motorcycle.setIsActive(request.getIsActive());
        }

        motorcycle.setUpdatedAt(Instant.now());

        Motorcycle saved = motorcycleRepository.save(motorcycle);
        return toResponse(saved);
    }

    @Transactional
    public void deleteMotorcycle(UUID motorcycleId, UUID userId) {
        Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        motorcycle.setDeletedAt(Instant.now());
        motorcycle.setUpdatedAt(Instant.now());
        motorcycleRepository.save(motorcycle);
    }

    @Transactional
    public MotorcycleResponse updateMileage(UUID motorcycleId, Integer mileage, UUID userId) {
        Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        motorcycle.setCurrentMileage(mileage);
        motorcycle.setUpdatedAt(Instant.now());

        Motorcycle saved = motorcycleRepository.save(motorcycle);
        return toResponse(saved);
    }

    private MotorcycleResponse toResponse(Motorcycle motorcycle) {
        return MotorcycleResponse.builder()
                .id(motorcycle.getId())
                .name(motorcycle.getName())
                .make(motorcycle.getMake())
                .model(motorcycle.getModel())
                .year(motorcycle.getYear())
                .licensePlate(motorcycle.getLicensePlate())
                .vin(motorcycle.getVin())
                .notes(motorcycle.getNotes())
                .initialMileage(motorcycle.getInitialMileage())
                .currentMileage(motorcycle.getCurrentMileage())
                .isActive(motorcycle.getIsActive())
                .imageUrl(motorcycle.getImageUrl())
                .createdAt(motorcycle.getCreatedAt())
                .updatedAt(motorcycle.getUpdatedAt())
                .build();
    }

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return 20;
        }
        return Math.min(size, 50);
    }

    private ScheduleResponse toScheduleResponse(MaintenanceSchedule schedule) {
        return ScheduleResponse.builder()
                .id(schedule.getId())
                .motorcycleId(schedule.getMotorcycle().getId())
                .templateId(schedule.getTemplate().getId())
                .templateName(schedule.getTemplate().getName())
                .intervalType(schedule.getIntervalType())
                .intervalMileage(schedule.getIntervalMileage())
                .intervalDays(schedule.getIntervalDays())
                .lastServiceMileage(schedule.getLastServiceMileage())
                .lastServiceDate(schedule.getLastServiceDate())
                .nextDueMileage(schedule.getNextDueMileage())
                .nextDueDate(schedule.getNextDueDate())
                .isActive(schedule.getIsActive())
                .createdAt(schedule.getCreatedAt())
                .updatedAt(schedule.getUpdatedAt())
                .build();
    }

    private ServiceLogResponse toServiceLogResponse(ServiceLog serviceLog) {
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
