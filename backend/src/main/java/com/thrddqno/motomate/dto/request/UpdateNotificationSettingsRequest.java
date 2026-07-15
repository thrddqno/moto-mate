package com.thrddqno.motomate.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateNotificationSettingsRequest {
    @Min(value = 1, message = "Reminder threshold days must be at least 1")
    @Max(value = 30, message = "Reminder threshold days must be at most 30")
    private Integer reminderThresholdDays;

    @Min(value = 1, message = "Reminder threshold percent must be at least 1")
    @Max(value = 50, message = "Reminder threshold percent must be at most 50")
    private Integer reminderThresholdPercent;
}
