package com.thrddqno.motomate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "break_in_tracker")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BreakInTracker {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "motorcycle_id", unique = true, nullable = false)
    private Motorcycle motorcycle;

    @Column(name = "initial_mileage", nullable = false)
    private Integer initialMileage;

    @Column(name = "break_in_limit", nullable = false)
    @Builder.Default
    private Integer breakInLimit = 500;

    @Column(name = "is_completed")
    @Builder.Default
    private Boolean isCompleted = false;

    @Column(name = "completed_at")
    private Instant completedAt;
}
