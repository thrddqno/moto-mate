package com.thrddqno.motomate.dto.request;

import com.thrddqno.motomate.enums.IntervalType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateScheduleRequest {

    private IntervalType intervalType;

    private Integer intervalMileage;

    private Integer intervalDays;

    private Boolean isActive;
}
