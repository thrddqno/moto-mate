package com.thrddqno.motomate.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Configuration
public class FirebaseConfig implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    @Value("${FIREBASE_SERVICE_ACCOUNT_JSON:}")
    private String firebaseServiceAccountJson;

    @Value("${FIREBASE_SERVICE_ACCOUNT_BASE64:}")
    private String firebaseServiceAccountBase64;

    @Override
    public void afterPropertiesSet() throws IOException {
        log.info("Initializing Firebase Admin SDK...");

        var credentials = resolveCredentials();
        var app = FirebaseApp.initializeApp(FirebaseOptions.builder()
                .setCredentials(credentials)
                .build());

        log.info("Firebase Admin SDK initialized. Project: {}", app.getOptions().getProjectId());

        try {
            FirebaseAuth.getInstance(app);
            log.info("FirebaseAuth instance obtained successfully");
        } catch (Exception e) {
            log.error("Failed to get FirebaseAuth instance: {}", e.getMessage(), e);
        }
    }

    private GoogleCredentials resolveCredentials() throws IOException {
        if (!firebaseServiceAccountBase64.isBlank()) {
            log.info("Loading Firebase credentials from FIREBASE_SERVICE_ACCOUNT_BASE64");
            var decoded = Base64.getDecoder().decode(firebaseServiceAccountBase64);
            return GoogleCredentials.fromStream(new ByteArrayInputStream(decoded));
        }
        if (!firebaseServiceAccountJson.isBlank()) {
            log.info("Loading Firebase credentials from FIREBASE_SERVICE_ACCOUNT_JSON");
            return GoogleCredentials.fromStream(
                    new ByteArrayInputStream(firebaseServiceAccountJson.getBytes(StandardCharsets.UTF_8)));
        }
        log.info("Loading Firebase credentials from classpath:firebase-service-account.json");
        var resource = getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");
        if (resource == null) {
            throw new IOException("firebase-service-account.json not found on classpath. " +
                    "Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_BASE64 env var, " +
                    "or place the file at src/main/resources/firebase-service-account.json");
        }
        return GoogleCredentials.fromStream(resource);
    }
}
