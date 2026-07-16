package com.thrddqno.motomate.controller;

import com.thrddqno.motomate.dto.ApiResponse;
import com.thrddqno.motomate.dto.response.CursorPageResponse;
import com.thrddqno.motomate.dto.response.ServiceLogResponse;
import com.thrddqno.motomate.security.CurrentUser;
import com.thrddqno.motomate.service.ServiceLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/service-logs")
@RequiredArgsConstructor
public class ServiceHistoryController {

    private final ServiceLogService serviceLogService;

    @GetMapping
    public ApiResponse<CursorPageResponse<ServiceLogResponse>> getServiceLogs(
            @CurrentUser UUID userId,
            @RequestParam(required = false) UUID motorcycleId,
            @RequestParam(required = false) String templateName,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int size) {
        CursorPageResponse<ServiceLogResponse> logs = serviceLogService.getUserServiceLogsKeyset(
                userId, motorcycleId, templateName, cursor, size);
        return ApiResponse.success("Service logs retrieved successfully", logs);
    }
}
