package com.thrddqno.motomate.service;

import com.google.firebase.messaging.*;
import com.thrddqno.motomate.entity.DeviceToken;
import com.thrddqno.motomate.repository.DeviceTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final DeviceTokenRepository deviceTokenRepository;

    public void sendNotification(UUID userId, String title, String body) {
        List<DeviceToken> deviceTokens = deviceTokenRepository.findByUserId(userId);

        if (deviceTokens.isEmpty()) {
            log.warn("No device tokens found for user {}", userId);
            return;
        }

        List<String> tokens = deviceTokens.stream()
                .map(DeviceToken::getToken)
                .toList();

        try {
            MulticastMessage message = MulticastMessage.builder()
                    .addAllTokens(tokens)
                    .putData("title", title)
                    .putData("body", body)
                    .setNotification(Notification.builder()
                            .setTitle(title)
                            .setBody(body)
                            .build())
                    .build();

            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);

            log.info("Sent notification to user {}: {} success, {} failure",
                    userId, response.getSuccessCount(), response.getFailureCount());

            response.getResponses().forEach(response1 -> {
                if (!response1.isSuccessful()) {
                    log.error("Failed to send notification: {}", response1.getException().getMessage());
                }
            });
        } catch (FirebaseMessagingException e) {
            log.error("Failed to send notification to user {}: {}", userId, e.getMessage());
        }
    }

    public void sendMaintenanceReminder(UUID userId, String bikeName, String taskName, String message) {
        String title = "Moto Mate Reminder";
        String body = String.format("%s for %s: %s", taskName, bikeName, message);
        sendNotification(userId, title, body);
    }
}
