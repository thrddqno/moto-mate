package com.thrddqno.motomate.controller;

import com.thrddqno.motomate.dto.ApiResponse;
import com.thrddqno.motomate.dto.request.RegisterDeviceTokenRequest;
import com.thrddqno.motomate.security.CurrentUser;
import com.thrddqno.motomate.service.DeviceTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/device-tokens")
@RequiredArgsConstructor
public class DeviceTokenController {

    private final DeviceTokenService deviceTokenService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Void> registerDeviceToken(
            @Valid @RequestBody RegisterDeviceTokenRequest request,
            @CurrentUser UUID userId) {
        deviceTokenService.registerDeviceToken(request.getToken(), request.getPlatform(), userId);
        return ApiResponse.success("Device token registered successfully", null);
    }

    @DeleteMapping
    public ApiResponse<Void> unregisterDeviceToken(
            @RequestParam String token,
            @CurrentUser UUID userId) {
        deviceTokenService.unregisterDeviceToken(token, userId);
        return ApiResponse.success("Device token unregistered successfully", null);
    }
}
