package com.thrddqno.motomate.service;

import com.thrddqno.motomate.dto.request.UpdateNotificationSettingsRequest;
import com.thrddqno.motomate.dto.response.UserProfileResponse;
import com.thrddqno.motomate.entity.User;
import com.thrddqno.motomate.exception.ResourceNotFoundException;
import com.thrddqno.motomate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfileResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        return toResponse(user);
    }

    @Transactional
    public UserProfileResponse updateNotificationSettings(UUID userId, UpdateNotificationSettingsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        if (request.getReminderThresholdDays() != null) {
            user.setReminderThresholdDays(request.getReminderThresholdDays());
        }
        
        if (request.getReminderThresholdPercent() != null) {
            user.setReminderThresholdPercent(request.getReminderThresholdPercent());
        }
        
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        
        return toResponse(user);
    }

    private UserProfileResponse toResponse(User user) {
        return UserProfileResponse.builder()
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .unitPreference(user.getUnitPreference())
                .reminderDigestTime(user.getReminderDigestTime())
                .reminderThresholdDays(user.getReminderThresholdDays())
                .reminderThresholdPercent(user.getReminderThresholdPercent())
                .build();
    }
}
