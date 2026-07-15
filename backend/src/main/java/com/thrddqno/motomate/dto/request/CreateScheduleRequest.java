package com.thrddqno.motomate.dto.request;

import com.thrddqno.motomate.enums.IntervalType;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateScheduleRequest {

    @NotNull(message = "Template ID is required")
    private UUID templateId;

    @NotNull(message = "Interval type is required")
    private IntervalType intervalType;

    private Integer intervalMileage;

    private Integer intervalDays;
}
