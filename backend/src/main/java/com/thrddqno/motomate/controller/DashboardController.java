package com.thrddqno.motomate.controller;

import com.thrddqno.motomate.dto.ApiResponse;
import com.thrddqno.motomate.dto.response.DashboardResponse;
import com.thrddqno.motomate.security.CurrentUser;
import com.thrddqno.motomate.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public ApiResponse<DashboardResponse> getDashboard(@CurrentUser UUID userId) {
        DashboardResponse dashboard = dashboardService.getDashboard(userId);
        return ApiResponse.success("Dashboard retrieved successfully", dashboard);
    }
}
