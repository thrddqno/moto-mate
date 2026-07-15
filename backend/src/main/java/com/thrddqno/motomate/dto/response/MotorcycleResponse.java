package com.thrddqno.motomate.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MotorcycleResponse {

    private UUID id;
    private String name;
    private String make;
    private String model;
    private Integer year;
    private String licensePlate;
    private String vin;
    private String notes;
    private Integer initialMileage;
    private Integer currentMileage;
    private Boolean isActive;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;
}
