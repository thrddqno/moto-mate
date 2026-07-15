package com.thrddqno.motomate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class User {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "firebase_uid", unique = true, nullable = false)
    private String firebaseUid;

    @Column(name = "email")
    private String email;

    @Column(name = "display_name")
    private String displayName;

    @Column(name = "unit_preference", length = 10)
    @Builder.Default
    private String unitPreference = "km";

    @Column(name = "reminder_digest_time")
    @Builder.Default
    private LocalTime reminderDigestTime = LocalTime.of(8, 0);

    @Column(name = "reminder_threshold_days")
    @Builder.Default
    private Integer reminderThresholdDays = 7;

    @Column(name = "reminder_threshold_percent")
    @Builder.Default
    private Integer reminderThresholdPercent = 10;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
