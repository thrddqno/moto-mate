package com.thrddqno.motomate.controller;

import com.thrddqno.motomate.dto.ApiResponse;
import com.thrddqno.motomate.dto.request.CreateTemplateRequest;
import com.thrddqno.motomate.dto.response.TemplateResponse;
import com.thrddqno.motomate.enums.MaintenanceCategory;
import com.thrddqno.motomate.security.CurrentUser;
import com.thrddqno.motomate.service.TemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    @GetMapping
    public ApiResponse<List<TemplateResponse>> getTemplates(
            @CurrentUser UUID userId,
            @RequestParam(required = false) MaintenanceCategory category) {
        List<TemplateResponse> templates = templateService.getTemplates(userId, category);
        return ApiResponse.success("Templates retrieved successfully", templates);
    }

    @GetMapping("/my")
    public ApiResponse<List<TemplateResponse>> getMyCustomTemplates(@CurrentUser UUID userId) {
        List<TemplateResponse> templates = templateService.getCustomTemplates(userId);
        return ApiResponse.success("Custom templates retrieved successfully", templates);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TemplateResponse> createCustomTemplate(
            @Valid @RequestBody CreateTemplateRequest request,
            @CurrentUser UUID userId) {
        TemplateResponse template = templateService.createCustomTemplate(request, userId);
        return ApiResponse.success("Custom template created successfully", template);
    }
}
