package com.thrddqno.motomate.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ServiceLogResponse {

    private UUID id;
    private UUID scheduleId;
    private UUID motorcycleId;
    private UUID templateId;
    private String templateName;
    private Integer mileageAtService;
    private LocalDate dateOfService;
    private BigDecimal cost;
    private String notes;
    private Instant createdAt;
}
