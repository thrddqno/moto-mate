package com.thrddqno.motomate.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI motoMateOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Moto Mate API")
                        .description("Motorcycle Maintenance Tracker API")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Moto Mate Team")
                                .email("support@motomate.app")))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .schemaRequirement("Bearer Authentication",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter Firebase ID Token"));
    }
}
