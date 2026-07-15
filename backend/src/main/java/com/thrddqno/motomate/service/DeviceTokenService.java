package com.thrddqno.motomate.service;

import com.thrddqno.motomate.entity.DeviceToken;
import com.thrddqno.motomate.enums.Platform;
import com.thrddqno.motomate.repository.DeviceTokenRepository;
import com.thrddqno.motomate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeviceTokenService {

    private final DeviceTokenRepository deviceTokenRepository;
    private final UserRepository userRepository;

    @Transactional
    public void registerDeviceToken(String token, Platform platform, UUID userId) {
        userRepository.findById(userId).ifPresent(user -> {
            deviceTokenRepository.findByToken(token).ifPresentOrElse(
                    existing -> {
                        existing.setPlatform(platform);
                        existing.setUser(user);
                        deviceTokenRepository.save(existing);
                        log.info("Updated device token for user {}", userId);
                    },
                    () -> {
                        DeviceToken deviceToken = DeviceToken.builder()
                                .token(token)
                                .platform(platform)
                                .user(user)
                                .build();
                        deviceTokenRepository.save(deviceToken);
                        log.info("Registered new device token for user {}", userId);
                    }
            );
        });
    }

    @Transactional
    public void unregisterDeviceToken(String token, UUID userId) {
        deviceTokenRepository.findByToken(token)
                .filter(dt -> dt.getUser().getId().equals(userId))
                .ifPresent(deviceTokenRepository::delete);
        log.info("Unregistered device token for user {}", userId);
    }
}
