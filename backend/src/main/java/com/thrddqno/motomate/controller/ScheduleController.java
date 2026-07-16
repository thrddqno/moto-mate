package com.thrddqno.motomate.controller;

import com.thrddqno.motomate.dto.ApiResponse;
import com.thrddqno.motomate.dto.request.CreateScheduleRequest;
import com.thrddqno.motomate.dto.request.UpdateScheduleRequest;
import com.thrddqno.motomate.dto.response.CursorPageResponse;
import com.thrddqno.motomate.dto.response.ScheduleResponse;
import com.thrddqno.motomate.security.CurrentUser;
import com.thrddqno.motomate.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/motorcycles/{motorcycleId}/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @GetMapping
    public ApiResponse<CursorPageResponse<ScheduleResponse>> getSchedules(
            @PathVariable UUID motorcycleId,
            @CurrentUser UUID userId,
            @RequestParam(required = false) String cursor,
            @RequestParam(defaultValue = "20") int size) {
        CursorPageResponse<ScheduleResponse> schedules = scheduleService.getSchedulesByMotorcycleId(
                motorcycleId, userId, cursor, size);
        return ApiResponse.success("Schedules retrieved successfully", schedules);
    }

    @GetMapping("/{scheduleId}")
    public ApiResponse<ScheduleResponse> getSchedule(@PathVariable UUID motorcycleId,
                                                     @PathVariable UUID scheduleId,
                                                     @CurrentUser UUID userId) {
        ScheduleResponse schedule = scheduleService.getScheduleById(scheduleId, userId);
        return ApiResponse.success("Schedule retrieved successfully", schedule);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ScheduleResponse> createSchedule(@PathVariable UUID motorcycleId,
                                                        @Valid @RequestBody CreateScheduleRequest request,
                                                        @CurrentUser UUID userId) {
        ScheduleResponse schedule = scheduleService.createSchedule(motorcycleId, request, userId);
        return ApiResponse.success("Schedule created successfully", schedule);
    }

    @PutMapping("/{scheduleId}")
    public ApiResponse<ScheduleResponse> updateSchedule(@PathVariable UUID motorcycleId,
                                                        @PathVariable UUID scheduleId,
                                                        @Valid @RequestBody UpdateScheduleRequest request,
                                                        @CurrentUser UUID userId) {
        ScheduleResponse schedule = scheduleService.updateSchedule(scheduleId, request, userId);
        return ApiResponse.success("Schedule updated successfully", schedule);
    }

    @DeleteMapping("/{scheduleId}")
    public ApiResponse<Void> deleteSchedule(@PathVariable UUID motorcycleId,
                                            @PathVariable UUID scheduleId,
                                            @CurrentUser UUID userId) {
        scheduleService.deleteSchedule(scheduleId, userId);
        return ApiResponse.success("Schedule deleted successfully", null);
    }
}
