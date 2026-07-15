package com.thrddqno.motomate.repository;

import com.thrddqno.motomate.entity.NotificationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {
    List<NotificationLog> findByUserId(UUID userId);
    List<NotificationLog> findByScheduleId(UUID scheduleId);
}
