package com.thrddqno.motomate.entity;

import com.thrddqno.motomate.enums.IntervalType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "maintenance_schedules")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public class MaintenanceSchedule {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorcycle_id", nullable = false)
    private Motorcycle motorcycle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    private MaintenanceTemplate template;

    @Column(name = "interval_type", nullable = false)
    @Enumerated(EnumType.STRING)
    private IntervalType intervalType;

    @Column(name = "interval_mileage")
    private Integer intervalMileage;

    @Column(name = "interval_days")
    private Integer intervalDays;

    @Column(name = "last_service_mileage")
    @Builder.Default
    private Integer lastServiceMileage = 0;

    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;

    @Column(name = "next_due_mileage")
    private Integer nextDueMileage;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "notifications_enabled")
    @Builder.Default
    private Boolean notificationsEnabled = true;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at")
    @Builder.Default
    private Instant updatedAt = Instant.now();

    @Column(name = "deleted_at")
    private Instant deletedAt;
}
