package com.thrddqno.motomate.controller;

import com.thrddqno.motomate.dto.ApiResponse;
import com.thrddqno.motomate.dto.request.UpdateNotificationSettingsRequest;
import com.thrddqno.motomate.dto.response.UserProfileResponse;
import com.thrddqno.motomate.security.CurrentUser;
import com.thrddqno.motomate.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ApiResponse<UserProfileResponse> getCurrentUser(@CurrentUser UUID userId) {
        UserProfileResponse profile = userService.getUserProfile(userId);
        return ApiResponse.success("User profile retrieved successfully", profile);
    }

    @PutMapping("/me/notification-settings")
    public ApiResponse<UserProfileResponse> updateNotificationSettings(
            @Valid @RequestBody UpdateNotificationSettingsRequest request,
            @CurrentUser UUID userId) {
        UserProfileResponse profile = userService.updateNotificationSettings(userId, request);
        return ApiResponse.success("Notification settings updated successfully", profile);
    }
}
