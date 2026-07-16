package com.thrddqno.motomate.service;

import com.thrddqno.motomate.dto.request.CreateScheduleRequest;
import com.thrddqno.motomate.dto.request.UpdateScheduleRequest;
import com.thrddqno.motomate.dto.response.CursorPageResponse;
import com.thrddqno.motomate.dto.response.ScheduleResponse;
import com.thrddqno.motomate.entity.MaintenanceSchedule;
import com.thrddqno.motomate.entity.MaintenanceTemplate;
import com.thrddqno.motomate.entity.Motorcycle;
import com.thrddqno.motomate.enums.IntervalType;
import com.thrddqno.motomate.exception.ResourceNotFoundException;
import com.thrddqno.motomate.repository.MaintenanceScheduleRepository;
import com.thrddqno.motomate.repository.MaintenanceTemplateRepository;
import com.thrddqno.motomate.repository.MotorcycleRepository;
import com.thrddqno.motomate.util.CursorCodec;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final MaintenanceScheduleRepository scheduleRepository;
    private final MaintenanceTemplateRepository templateRepository;
    private final MotorcycleRepository motorcycleRepository;

    public List<ScheduleResponse> getSchedulesByMotorcycleId(UUID motorcycleId, UUID userId) {
        motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        return scheduleRepository.findByMotorcycleId(motorcycleId).stream()
                .map(this::toResponse)
                .toList();
    }

    public CursorPageResponse<ScheduleResponse> getSchedulesByMotorcycleId(UUID motorcycleId, UUID userId, String cursor, int size) {
        motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        int pageSize = normalizePageSize(size);
        List<MaintenanceSchedule> schedules = scheduleRepository.findByMotorcycleIdKeyset(
                motorcycleId,
                CursorCodec.decodeInstant(cursor),
                PageRequest.of(0, pageSize + 1));

        boolean hasMore = schedules.size() > pageSize;
        List<MaintenanceSchedule> pageItems = hasMore ? schedules.subList(0, pageSize) : schedules;
        String nextCursor = hasMore ? CursorCodec.encode(pageItems.getLast().getCreatedAt()) : null;

        return CursorPageResponse.<ScheduleResponse>builder()
                .content(pageItems.stream().map(this::toResponse).toList())
                .nextCursor(nextCursor)
                .hasMore(hasMore)
                .pageSize(pageSize)
                .build();
    }

    public ScheduleResponse getScheduleById(UUID scheduleId, UUID userId) {
        MaintenanceSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        if (!schedule.getMotorcycle().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Schedule not found");
        }

        return toResponse(schedule);
    }

    @Transactional
    public ScheduleResponse createSchedule(UUID motorcycleId, CreateScheduleRequest request, UUID userId) {
        Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        MaintenanceTemplate template = templateRepository.findById(request.getTemplateId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                .motorcycle(motorcycle)
                .template(template)
                .intervalType(request.getIntervalType())
                .intervalMileage(request.getIntervalMileage())
                .intervalDays(request.getIntervalDays())
                .lastServiceMileage(motorcycle.getCurrentMileage())
                .lastServiceDate(LocalDate.now())
                .isActive(true)
                .build();

        calculateNextDue(schedule, motorcycle.getCurrentMileage(), LocalDate.now());

        MaintenanceSchedule saved = scheduleRepository.save(schedule);
        return toResponse(saved);
    }

    @Transactional
    public ScheduleResponse updateSchedule(UUID scheduleId, UpdateScheduleRequest request, UUID userId) {
        MaintenanceSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        if (!schedule.getMotorcycle().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Schedule not found");
        }

        if (request.getIntervalType() != null) {
            schedule.setIntervalType(request.getIntervalType());
        }

        if (request.getIntervalMileage() != null) {
            schedule.setIntervalMileage(request.getIntervalMileage());
        }

        if (request.getIntervalDays() != null) {
            schedule.setIntervalDays(request.getIntervalDays());
        }

        if (request.getIsActive() != null) {
            schedule.setIsActive(request.getIsActive());
        }

        calculateNextDue(schedule, schedule.getLastServiceMileage(), schedule.getLastServiceDate());
        schedule.setUpdatedAt(Instant.now());

        MaintenanceSchedule saved = scheduleRepository.save(schedule);
        return toResponse(saved);
    }

    @Transactional
    public void deleteSchedule(UUID scheduleId, UUID userId) {
        MaintenanceSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule not found"));

        if (!schedule.getMotorcycle().getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Schedule not found");
        }

        schedule.setDeletedAt(Instant.now());
        schedule.setUpdatedAt(Instant.now());
        scheduleRepository.save(schedule);
    }

    private void calculateNextDue(MaintenanceSchedule schedule, Integer currentMileage, LocalDate currentDate) {
        IntervalType intervalType = schedule.getIntervalType();

        if (intervalType == IntervalType.MILEAGE || intervalType == IntervalType.BOTH) {
            if (schedule.getIntervalMileage() != null) {
                schedule.setNextDueMileage(currentMileage + schedule.getIntervalMileage());
            }
        }

        if (intervalType == IntervalType.DATE || intervalType == IntervalType.BOTH) {
            if (schedule.getIntervalDays() != null) {
                schedule.setNextDueDate(currentDate.plusDays(schedule.getIntervalDays()));
            }
        }
    }

    private ScheduleResponse toResponse(MaintenanceSchedule schedule) {
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

    private int normalizePageSize(int size) {
        if (size <= 0) {
            return 20;
        }
        return Math.min(size, 50);
    }
}
