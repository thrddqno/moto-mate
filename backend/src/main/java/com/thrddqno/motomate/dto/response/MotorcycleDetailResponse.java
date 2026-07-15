package com.thrddqno.motomate.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MotorcycleDetailResponse {

    private UUID id;
    private String make;
    private String model;
    private Integer year;
    private String licensePlate;
    private String vin;
    private String notes;
    private Integer currentMileage;
    private Boolean isActive;
    private Instant createdAt;
    private Instant updatedAt;
    
    private List<ScheduleResponse> schedules;
    private List<ServiceLogResponse> recentServiceLogs;
    
    private int totalSchedules;
    private int overdueCount;
    private int dueSoonCount;
    private int upcomingCount;
}
