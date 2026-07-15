package com.thrddqno.motomate.exception;

public class FirebaseAuthenticationException extends RuntimeException {

    public FirebaseAuthenticationException(String message) {
        super(message);
    }

    public FirebaseAuthenticationException(String message, Throwable cause) {
        super(message, cause);
    }
}
