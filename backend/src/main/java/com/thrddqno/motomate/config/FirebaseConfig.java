package com.thrddqno.motomate.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ResourceLoader;

import java.io.IOException;

@Configuration
public class FirebaseConfig {
    @Bean
    public FirebaseApp firebaseApp(ResourceLoader resourceLoader) throws IOException {
        var resource = resourceLoader.getResource("classpath:firebase-service-account.json");
        var credentials = GoogleCredentials.fromStream(resource.getInputStream());

        return FirebaseApp.initializeApp(FirebaseOptions.builder()
                .setCredentials(credentials)
                .build());
    }
}
