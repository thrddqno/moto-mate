package com.thrddqno.motomate.dto.request;

import com.thrddqno.motomate.enums.MaintenanceCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateTemplateRequest {
    @NotBlank(message = "Template name is required")
    private String name;

    @NotNull(message = "Category is required")
    private MaintenanceCategory category;

    private String description;
    private String icon;
    private Integer defaultIntervalMileage;
    private Integer defaultIntervalDays;
}
