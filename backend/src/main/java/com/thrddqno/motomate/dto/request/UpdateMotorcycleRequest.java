package com.thrddqno.motomate.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMotorcycleRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String make;

    private String model;

    private Integer year;

    private String licensePlate;

    private String vin;

    private String notes;

    @Min(value = 0, message = "Current mileage must be non-negative")
    private Integer currentMileage;

    private Boolean isActive;
}
