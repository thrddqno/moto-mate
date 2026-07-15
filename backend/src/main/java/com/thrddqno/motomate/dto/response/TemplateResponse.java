package com.thrddqno.motomate.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.thrddqno.motomate.enums.MaintenanceCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class TemplateResponse {
    private UUID id;
    private String name;
    private MaintenanceCategory category;
    private String description;
    private String icon;
    private Integer defaultIntervalMileage;
    private Integer defaultIntervalDays;
    private Boolean isSpecial;
    private Boolean isSystem;
}
