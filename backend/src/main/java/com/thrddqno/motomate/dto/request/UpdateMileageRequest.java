package com.thrddqno.motomate.dto.request;

import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateMileageRequest {
    @Min(value = 0, message = "Mileage must be non-negative")
    private Integer mileage;
}
