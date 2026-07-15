package com.thrddqno.motomate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MotomateApplication {

	public static void main(String[] args) {
		SpringApplication.run(MotomateApplication.class, args);
	}

}
