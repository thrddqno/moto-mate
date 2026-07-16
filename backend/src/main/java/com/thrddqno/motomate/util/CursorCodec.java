package com.thrddqno.motomate.util;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

public final class CursorCodec {

    private CursorCodec() {
    }

    public static String encode(Instant instant) {
        if (instant == null) {
            return null;
        }
        return Base64.getUrlEncoder().withoutPadding()
                .encodeToString(instant.toString().getBytes(StandardCharsets.UTF_8));
    }

    public static Instant decodeInstant(String cursor) {
        if (cursor == null || cursor.isBlank()) {
            return null;
        }
        String decoded = new String(Base64.getUrlDecoder().decode(cursor), StandardCharsets.UTF_8);
        return Instant.parse(decoded);
    }
}
