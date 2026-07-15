package com.thrddqno.motomate.dto.request;

import com.thrddqno.motomate.enums.Platform;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterDeviceTokenRequest {
    @NotNull(message = "Token is required")
    private String token;

    @NotNull(message = "Platform is required")
    private Platform platform;
}
