package com.thrddqno.motomate.dto.request;

import lombok.Data;

@Data
public class SyncProfileRequest {
    private String displayName;
    private String email;
    private String unitPreference;
}
