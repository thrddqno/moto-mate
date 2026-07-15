package com.thrddqno.motomate.entity;

import com.thrddqno.motomate.enums.NotificationStatus;
import com.thrddqno.motomate.enums.NotificationType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "notification_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationLog {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id")
    private MaintenanceSchedule schedule;

    @Column(name = "sent_at")
    @Builder.Default
    private Instant sentAt = Instant.now();

    @Column(name = "status")
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.SENT;

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private NotificationType type;
}
