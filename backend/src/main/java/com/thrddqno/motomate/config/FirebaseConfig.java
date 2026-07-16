package com.thrddqno.motomate.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import com.google.firebase.auth.FirebaseAuth;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;

import java.io.IOException;
import java.net.http.HttpClient;
import java.time.Duration;

@Configuration
public class FirebaseConfig implements InitializingBean {

    private static final Logger log = LoggerFactory.getLogger(FirebaseConfig.class);

    private final ResourceLoader resourceLoader;

    public FirebaseConfig(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Override
    public void afterPropertiesSet() throws IOException {
        log.info("Initializing Firebase Admin SDK...");
        var resource = resourceLoader.getResource("classpath:firebase-service-account.json");
        var credentials = GoogleCredentials.fromStream(resource.getInputStream());

        var app = FirebaseApp.initializeApp(FirebaseOptions.builder()
                .setCredentials(credentials)
                .build());

        log.info("Firebase Admin SDK initialized. Project: {}", app.getOptions().getProjectId());

        // Test that we can reach the auth service
        try {
            FirebaseAuth.getInstance(app);
            log.info("FirebaseAuth instance obtained successfully");
        } catch (Exception e) {
            log.error("Failed to get FirebaseAuth instance: {}", e.getMessage(), e);
        }
    }
}
