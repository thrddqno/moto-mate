package com.thrddqno.motomate.service;

import com.thrddqno.motomate.dto.request.CreateMotorcycleRequest;
import com.thrddqno.motomate.dto.request.UpdateMotorcycleRequest;
import com.thrddqno.motomate.dto.response.MotorcycleResponse;
import com.thrddqno.motomate.entity.Motorcycle;
import com.thrddqno.motomate.entity.User;
import com.thrddqno.motomate.exception.ResourceNotFoundException;
import com.thrddqno.motomate.repository.MotorcycleRepository;
import com.thrddqno.motomate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MotorcycleService {

    private final MotorcycleRepository motorcycleRepository;
    private final UserRepository userRepository;

    public List<MotorcycleResponse> getMotorcyclesByUserId(UUID userId) {
        return motorcycleRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    public MotorcycleResponse getMotorcycleById(UUID motorcycleId, UUID userId) {
        Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));
        return toResponse(motorcycle);
    }

    @Transactional
    public MotorcycleResponse createMotorcycle(CreateMotorcycleRequest request, UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Motorcycle motorcycle = Motorcycle.builder()
                .user(user)
                .name(request.getName())
                .make(request.getMake())
                .model(request.getModel())
                .year(request.getYear())
                .licensePlate(request.getLicensePlate())
                .vin(request.getVin())
                .notes(request.getNotes())
                .currentMileage(request.getCurrentMileage())
                .initialMileage(request.getCurrentMileage())
                .isActive(true)
                .build();

        Motorcycle saved = motorcycleRepository.save(motorcycle);
        return toResponse(saved);
    }

    @Transactional
    public MotorcycleResponse updateMotorcycle(UUID motorcycleId, UpdateMotorcycleRequest request, UUID userId) {
        Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        motorcycle.setName(request.getName());
        motorcycle.setMake(request.getMake());
        motorcycle.setModel(request.getModel());
        motorcycle.setYear(request.getYear());
        motorcycle.setLicensePlate(request.getLicensePlate());
        motorcycle.setVin(request.getVin());
        motorcycle.setNotes(request.getNotes());

        if (request.getCurrentMileage() != null) {
            motorcycle.setCurrentMileage(request.getCurrentMileage());
        }

        if (request.getIsActive() != null) {
            motorcycle.setIsActive(request.getIsActive());
        }

        motorcycle.setUpdatedAt(Instant.now());

        Motorcycle saved = motorcycleRepository.save(motorcycle);
        return toResponse(saved);
    }

    @Transactional
    public void deleteMotorcycle(UUID motorcycleId, UUID userId) {
        Motorcycle motorcycle = motorcycleRepository.findById(motorcycleId)
                .filter(m -> m.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Motorcycle not found"));

        motorcycle.setDeletedAt(Instant.now());
        motorcycle.setUpdatedAt(Instant.now());
        motorcycleRepository.save(motorcycle);
    }

    private MotorcycleResponse toResponse(Motorcycle motorcycle) {
        return MotorcycleResponse.builder()
                .id(motorcycle.getId())
                .name(motorcycle.getName())
                .make(motorcycle.getMake())
                .model(motorcycle.getModel())
                .year(motorcycle.getYear())
                .licensePlate(motorcycle.getLicensePlate())
                .vin(motorcycle.getVin())
                .notes(motorcycle.getNotes())
                .initialMileage(motorcycle.getInitialMileage())
                .currentMileage(motorcycle.getCurrentMileage())
                .isActive(motorcycle.getIsActive())
                .imageUrl(motorcycle.getImageUrl())
                .createdAt(motorcycle.getCreatedAt())
                .updatedAt(motorcycle.getUpdatedAt())
                .build();
    }
}
