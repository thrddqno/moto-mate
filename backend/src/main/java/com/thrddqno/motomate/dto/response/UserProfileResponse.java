package com.thrddqno.motomate.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private String email;
    private String displayName;
    private String unitPreference;
    private LocalTime reminderDigestTime;
    private Integer reminderThresholdDays;
    private Integer reminderThresholdPercent;
}
