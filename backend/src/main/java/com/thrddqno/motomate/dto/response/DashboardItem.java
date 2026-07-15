package com.thrddqno.motomate.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardItem {

    private UUID scheduleId;
    private UUID motorcycleId;
    private String motorcycleName;
    private UUID templateId;
    private String templateName;
    private String categoryName;
    private Integer intervalMileage;
    private Integer intervalDays;
    private Integer nextDueMileage;
    private LocalDate nextDueDate;
    private Integer currentMileage;
    private LocalDate currentDate;
    private String status; // OVERDUE, DUE_SOON, UPCOMING
    private Integer milesRemaining;
    private Long daysRemaining;
}
