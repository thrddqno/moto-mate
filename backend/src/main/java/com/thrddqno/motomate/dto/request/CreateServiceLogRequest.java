package com.thrddqno.motomate.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateServiceLogRequest {

    @NotNull(message = "Schedule ID is required")
    private UUID scheduleId;

    @NotNull(message = "Date of service is required")
    private LocalDate dateOfService;

    @NotNull(message = "Mileage is required")
    @Min(value = 0, message = "Mileage must be non-negative")
    private Integer mileageAtService;

    private BigDecimal cost;

    private String notes;
}
