package com.thrddqno.motomate.controller;

import com.thrddqno.motomate.dto.ApiResponse;
import com.thrddqno.motomate.dto.request.CreateMotorcycleRequest;
import com.thrddqno.motomate.dto.request.UpdateMileageRequest;
import com.thrddqno.motomate.dto.request.UpdateMotorcycleRequest;
import com.thrddqno.motomate.dto.response.MotorcycleResponse;
import com.thrddqno.motomate.security.CurrentUser;
import com.thrddqno.motomate.service.MotorcycleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/motorcycles")
@RequiredArgsConstructor
public class MotorcycleController {

    private final MotorcycleService motorcycleService;

    @GetMapping
    public ApiResponse<List<MotorcycleResponse>> getMotorcycles(@CurrentUser UUID userId) {
        List<MotorcycleResponse> motorcycles = motorcycleService.getMotorcyclesByUserId(userId);
        return ApiResponse.success("Motorcycles retrieved successfully", motorcycles);
    }

    @GetMapping("/{id}")
    public ApiResponse<MotorcycleResponse> getMotorcycle(@PathVariable UUID id, @CurrentUser UUID userId) {
        MotorcycleResponse motorcycle = motorcycleService.getMotorcycleById(id, userId);
        return ApiResponse.success("Motorcycle retrieved successfully", motorcycle);
    }

    @GetMapping("/{id}/detail")
    public ApiResponse<?> getMotorcycleDetail(@PathVariable UUID id, @CurrentUser UUID userId) {
        var detail = motorcycleService.getMotorcycleDetail(id, userId);
        return ApiResponse.success("Motorcycle detail retrieved successfully", detail);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<MotorcycleResponse> createMotorcycle(@Valid @RequestBody CreateMotorcycleRequest request,
                                                            @CurrentUser UUID userId) {
        MotorcycleResponse motorcycle = motorcycleService.createMotorcycle(request, userId);
        return ApiResponse.success("Motorcycle created successfully", motorcycle);
    }

    @PutMapping("/{id}")
    public ApiResponse<MotorcycleResponse> updateMotorcycle(@PathVariable UUID id,
                                                            @Valid @RequestBody UpdateMotorcycleRequest request,
                                                            @CurrentUser UUID userId) {
        MotorcycleResponse motorcycle = motorcycleService.updateMotorcycle(id, request, userId);
        return ApiResponse.success("Motorcycle updated successfully", motorcycle);
    }

    @PatchMapping("/{id}/mileage")
    public ApiResponse<MotorcycleResponse> updateMileage(@PathVariable UUID id,
                                                         @Valid @RequestBody UpdateMileageRequest request,
                                                         @CurrentUser UUID userId) {
        MotorcycleResponse motorcycle = motorcycleService.updateMileage(id, request.getMileage(), userId);
        return ApiResponse.success("Mileage updated successfully", motorcycle);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteMotorcycle(@PathVariable UUID id, @CurrentUser UUID userId) {
        motorcycleService.deleteMotorcycle(id, userId);
        return ApiResponse.success("Motorcycle deleted successfully", null);
    }
}
