package com.thrddqno.motomate.scheduler;

import com.thrddqno.motomate.entity.MaintenanceSchedule;
import com.thrddqno.motomate.entity.Motorcycle;
import com.thrddqno.motomate.entity.NotificationLog;
import com.thrddqno.motomate.entity.User;
import com.thrddqno.motomate.enums.IntervalType;
import com.thrddqno.motomate.enums.NotificationStatus;
import com.thrddqno.motomate.enums.NotificationType;
import com.thrddqno.motomate.repository.MaintenanceScheduleRepository;
import com.thrddqno.motomate.repository.NotificationLogRepository;
import com.thrddqno.motomate.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReminderScheduler {

    private final MaintenanceScheduleRepository scheduleRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final NotificationService notificationService;

    private static final int DEFAULT_MILEAGE_THRESHOLD_PERCENT = 10;
    private static final int DEFAULT_DATE_THRESHOLD_DAYS = 7;

    @Scheduled(cron = "0 0 8 * * *") // Run daily at 8 AM
    public void sendDailyReminders() {
        log.info("Starting daily reminder check...");
        
        List<MaintenanceSchedule> activeSchedules = scheduleRepository.findByIsActive(true);
        
        for (MaintenanceSchedule schedule : activeSchedules) {
            try {
                processSchedule(schedule);
            } catch (Exception e) {
                log.error("Error processing schedule {}: {}", schedule.getId(), e.getMessage());
            }
        }
        
        log.info("Daily reminder check completed. Processed {} schedules", activeSchedules.size());
    }

    private void processSchedule(MaintenanceSchedule schedule) {
        Motorcycle motorcycle = schedule.getMotorcycle();
        User user = motorcycle.getUser();
        
        // Skip if notifications are disabled for this schedule
        if (!schedule.getNotificationsEnabled()) {
            return;
        }
        
        boolean isDueSoon = false;
        String message = "";
        
        int mileageThresholdPercent = user.getReminderThresholdPercent() != null ? 
                user.getReminderThresholdPercent() : DEFAULT_MILEAGE_THRESHOLD_PERCENT;
        int dateThresholdDays = user.getReminderThresholdDays() != null ? 
                user.getReminderThresholdDays() : DEFAULT_DATE_THRESHOLD_DAYS;
        
        if (schedule.getIntervalType() == IntervalType.MILEAGE || 
            schedule.getIntervalType() == IntervalType.BOTH) {
            if (schedule.getNextDueMileage() != null && motorcycle.getCurrentMileage() != null) {
                long remainingKm = schedule.getNextDueMileage() - motorcycle.getCurrentMileage();
                long thresholdKm = (long) (schedule.getIntervalMileage() * mileageThresholdPercent / 100.0);
                
                if (remainingKm <= 0) {
                    isDueSoon = true;
                    message = String.format("Overdue by %d km", Math.abs(remainingKm));
                } else if (remainingKm <= thresholdKm) {
                    isDueSoon = true;
                    message = String.format("Due in %d km", remainingKm);
                }
            }
        }
        
        if (schedule.getIntervalType() == IntervalType.DATE || 
            schedule.getIntervalType() == IntervalType.BOTH) {
            if (schedule.getNextDueDate() != null) {
                long daysUntilDue = ChronoUnit.DAYS.between(LocalDate.now(), schedule.getNextDueDate());
                
                if (daysUntilDue <= 0) {
                    isDueSoon = true;
                    message = String.format("Overdue by %d days", Math.abs(daysUntilDue));
                } else if (daysUntilDue <= dateThresholdDays) {
                    isDueSoon = true;
                    message = String.format("Due in %d days", daysUntilDue);
                }
            }
        }
        
        if (isDueSoon) {
            if (!hasNotificationBeenSentRecently(schedule.getId())) {
                String taskName = schedule.getTemplate().getName();
                String bikeName = motorcycle.getMake() + " " + motorcycle.getModel();
                
                notificationService.sendMaintenanceReminder(user.getId(), bikeName, taskName, message);
                
                saveNotificationLog(user, schedule, NotificationType.DIGEST);
                
                log.info("Sent reminder for {} on {}: {}", taskName, bikeName, message);
            }
        }
    }

    private boolean hasNotificationBeenSentRecently(UUID scheduleId) {
        Instant oneDayAgo = Instant.now().minus(24, ChronoUnit.HOURS);
        
        return notificationLogRepository.findByScheduleId(scheduleId).stream()
                .anyMatch(log -> log.getSentAt().isAfter(oneDayAgo) && 
                                 log.getType() == NotificationType.DIGEST);
    }

    private void saveNotificationLog(User user, MaintenanceSchedule schedule, NotificationType type) {
        NotificationLog notificationLog = NotificationLog.builder()
                .user(user)
                .schedule(schedule)
                .type(type)
                .status(NotificationStatus.SENT)
                .sentAt(Instant.now())
                .build();
        
        notificationLogRepository.save(notificationLog);
    }
}
