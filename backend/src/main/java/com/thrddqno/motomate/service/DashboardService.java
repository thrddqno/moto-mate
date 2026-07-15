package com.thrddqno.motomate.service;

import com.thrddqno.motomate.dto.response.DashboardItem;
import com.thrddqno.motomate.dto.response.DashboardResponse;
import com.thrddqno.motomate.entity.MaintenanceSchedule;
import com.thrddqno.motomate.entity.Motorcycle;
import com.thrddqno.motomate.enums.IntervalType;
import com.thrddqno.motomate.repository.MaintenanceScheduleRepository;
import com.thrddqno.motomate.repository.MotorcycleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MaintenanceScheduleRepository scheduleRepository;
    private final MotorcycleRepository motorcycleRepository;

    @Value("${app.dashboard.due-soon-days:7}")
    private int dueSoonDays;

    public DashboardResponse getDashboard(UUID userId) {
        List<Motorcycle> motorcycles = motorcycleRepository.findByUserIdAndIsActive(userId, true);
        List<MaintenanceSchedule> allSchedules = new ArrayList<>();

        for (Motorcycle motorcycle : motorcycles) {
            List<MaintenanceSchedule> schedules = scheduleRepository.findByMotorcycleIdAndIsActive(motorcycle.getId(), true);
            allSchedules.addAll(schedules);
        }

        List<DashboardItem> overdue = new ArrayList<>();
        List<DashboardItem> dueSoon = new ArrayList<>();
        List<DashboardItem> upcoming = new ArrayList<>();

        LocalDate today = LocalDate.now();

        for (MaintenanceSchedule schedule : allSchedules) {
            DashboardItem item = buildDashboardItem(schedule, today);
            String status = item.getStatus();

            switch (status) {
                case "OVERDUE" -> overdue.add(item);
                case "DUE_SOON" -> dueSoon.add(item);
                default -> upcoming.add(item);
            }
        }

        return DashboardResponse.builder()
                .totalBikes(motorcycles.size())
                .totalActiveSchedules(allSchedules.size())
                .overdue(overdue)
                .dueSoon(dueSoon)
                .upcoming(upcoming)
                .build();
    }

    private DashboardItem buildDashboardItem(MaintenanceSchedule schedule, LocalDate today) {
        Motorcycle motorcycle = schedule.getMotorcycle();
        Integer currentMileage = motorcycle.getCurrentMileage();

        Integer milesRemaining = null;
        Long daysRemaining = null;
        String status = "UPCOMING";

        if (schedule.getIntervalType() == IntervalType.MILEAGE || schedule.getIntervalType() == IntervalType.BOTH) {
            if (schedule.getNextDueMileage() != null) {
                milesRemaining = schedule.getNextDueMileage() - currentMileage;
                if (milesRemaining <= 0) {
                    status = "OVERDUE";
                } else if (milesRemaining <= 1000) {
                    status = "DUE_SOON";
                }
            }
        }

        if (schedule.getIntervalType() == IntervalType.DATE || schedule.getIntervalType() == IntervalType.BOTH) {
            if (schedule.getNextDueDate() != null) {
                daysRemaining = java.time.temporal.ChronoUnit.DAYS.between(today, schedule.getNextDueDate());
                if (daysRemaining <= 0) {
                    status = "OVERDUE";
                } else if (daysRemaining <= dueSoonDays) {
                    if (!"OVERDUE".equals(status)) {
                        status = "DUE_SOON";
                    }
                }
            }
        }

        return DashboardItem.builder()
                .scheduleId(schedule.getId())
                .motorcycleId(motorcycle.getId())
                .motorcycleName(motorcycle.getName())
                .templateId(schedule.getTemplate().getId())
                .templateName(schedule.getTemplate().getName())
                .categoryName(schedule.getTemplate().getCategory().name())
                .intervalMileage(schedule.getIntervalMileage())
                .intervalDays(schedule.getIntervalDays())
                .nextDueMileage(schedule.getNextDueMileage())
                .nextDueDate(schedule.getNextDueDate())
                .currentMileage(currentMileage)
                .currentDate(today)
                .status(status)
                .milesRemaining(milesRemaining)
                .daysRemaining(daysRemaining)
                .build();
    }
}
