package com.thrddqno.motomate.controller;

import com.thrddqno.motomate.dto.ApiResponse;
import com.thrddqno.motomate.dto.request.CreateServiceLogRequest;
import com.thrddqno.motomate.dto.response.CursorPageResponse;
import com.thrddqno.motomate.dto.response.PagedResponse;
import com.thrddqno.motomate.dto.response.ServiceLogResponse;
import com.thrddqno.motomate.security.CurrentUser;
import com.thrddqno.motomate.service.ServiceLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/motorcycles/{motorcycleId}/logs")
@RequiredArgsConstructor
public class ServiceLogController {

    private final ServiceLogService serviceLogService;

    @GetMapping
    public ApiResponse<CursorPageResponse<ServiceLogResponse>> getServiceLogs(
            @PathVariable UUID motorcycleId,
            @CurrentUser UUID userId,
            @RequestParam(required = false) String templateName,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int size) {
        CursorPageResponse<ServiceLogResponse> logs = serviceLogService.getServiceLogsKeyset(
                motorcycleId, userId, templateName, cursor, size);
        return ApiResponse.success("Service logs retrieved successfully", logs);
    }

    @GetMapping("/paginated")
    public ApiResponse<PagedResponse<ServiceLogResponse>> getServiceLogsPaginated(
            @PathVariable UUID motorcycleId,
            @CurrentUser UUID userId,
            @RequestParam(required = false) String templateName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<ServiceLogResponse> logs = serviceLogService.getServiceLogsPaginated(
                motorcycleId, userId, templateName, page, size);
        return ApiResponse.success("Service logs retrieved successfully", logs);
    }

    @GetMapping("/{logId}")
    public ApiResponse<ServiceLogResponse> getServiceLog(@PathVariable UUID motorcycleId,
                                                         @PathVariable UUID logId,
                                                         @CurrentUser UUID userId) {
        ServiceLogResponse log = serviceLogService.getServiceLogById(logId, userId);
        return ApiResponse.success("Service log retrieved successfully", log);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ServiceLogResponse> createServiceLog(@PathVariable UUID motorcycleId,
                                                            @Valid @RequestBody CreateServiceLogRequest request,
                                                            @CurrentUser UUID userId) {
        ServiceLogResponse log = serviceLogService.createServiceLog(motorcycleId, request, userId);
        return ApiResponse.success("Service log created successfully", log);
    }
}
