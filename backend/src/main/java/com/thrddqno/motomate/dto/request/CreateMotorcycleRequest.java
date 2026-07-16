package com.thrddqno.motomate.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMotorcycleRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String make;

    private String model;

    private Integer year;

    private String licensePlate;

    private String vin;

    private String notes;

    @NotNull(message = "Current mileage is required")
    @Min(value = 0, message = "Current mileage must be non-negative")
    private Integer currentMileage;

    private List<UUID> templateIds;
}
