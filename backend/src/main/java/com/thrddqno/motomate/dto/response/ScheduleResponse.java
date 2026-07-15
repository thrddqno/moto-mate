package com.thrddqno.motomate.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.thrddqno.motomate.enums.IntervalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ScheduleResponse {

    private UUID id;
    private UUID motorcycleId;
    private UUID templateId;
    private String templateName;
    private IntervalType intervalType;
    private Integer intervalMileage;
    private Integer intervalDays;
    private Integer lastServiceMileage;
    private LocalDate lastServiceDate;
    private Integer nextDueMileage;
    private LocalDate nextDueDate;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
}
