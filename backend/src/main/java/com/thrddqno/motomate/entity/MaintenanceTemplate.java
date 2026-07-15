package com.thrddqno.motomate.entity;

import com.thrddqno.motomate.enums.MaintenanceCategory;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UuidGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "maintenance_templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenanceTemplate {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "category", nullable = false)
    @Enumerated(EnumType.STRING)
    private MaintenanceCategory category;

    @Column(name = "description")
    private String description;

    @Column(name = "default_interval_mileage")
    private Integer defaultIntervalMileage;

    @Column(name = "default_interval_days")
    private Integer defaultIntervalDays;

    @Column(name = "is_special")
    @Builder.Default
    private Boolean isSpecial = false;

    @Column(name = "is_public")
    @Builder.Default
    private Boolean isPublic = true;

    @Column(name = "created_at")
    @Builder.Default
    private Instant createdAt = Instant.now();
}
