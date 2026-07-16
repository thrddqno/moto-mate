package com.thrddqno.motomate.service;

import com.thrddqno.motomate.dto.request.CreateMotorcycleRequest;
import com.thrddqno.motomate.dto.request.UpdateMileageRequest;
import com.thrddqno.motomate.dto.response.MotorcycleResponse;
import com.thrddqno.motomate.entity.Motorcycle;
import com.thrddqno.motomate.entity.User;
import com.thrddqno.motomate.exception.ResourceNotFoundException;
import com.thrddqno.motomate.repository.MaintenanceScheduleRepository;
import com.thrddqno.motomate.repository.MaintenanceTemplateRepository;
import com.thrddqno.motomate.repository.MotorcycleRepository;
import com.thrddqno.motomate.repository.ServiceLogRepository;
import com.thrddqno.motomate.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MotorcycleServiceTest {

    @Mock
    private MotorcycleRepository motorcycleRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private MaintenanceScheduleRepository scheduleRepository;

    @Mock
    private ServiceLogRepository serviceLogRepository;

    @Mock
    private MaintenanceTemplateRepository templateRepository;

    @InjectMocks
    private MotorcycleService motorcycleService;

    private User user;
    private Motorcycle motorcycle;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(UUID.randomUUID())
                .firebaseUid("firebase-uid-123")
                .email("test@example.com")
                .build();

        motorcycle = Motorcycle.builder()
                .id(UUID.randomUUID())
                .user(user)
                .make("Honda")
                .model("Click 125i")
                .year(2023)
                .currentMileage(5000)
                .initialMileage(100)
                .isActive(true)
                .build();
    }

    @Test
    void getMotorcyclesByUserId_returnsList() {
        when(motorcycleRepository.findByUserId(user.getId()))
                .thenReturn(List.of(motorcycle));

        List<MotorcycleResponse> response = motorcycleService.getMotorcyclesByUserId(user.getId());

        assertNotNull(response);
        assertEquals(1, response.size());
        assertEquals("Honda", response.get(0).getMake());
        assertEquals("Click 125i", response.get(0).getModel());
    }

    @Test
    void getMotorcycleById_validOwner_returnsMotorcycle() {
        when(motorcycleRepository.findById(motorcycle.getId()))
                .thenReturn(Optional.of(motorcycle));

        MotorcycleResponse response = motorcycleService.getMotorcycleById(motorcycle.getId(), user.getId());

        assertNotNull(response);
        assertEquals(motorcycle.getId(), response.getId());
    }

    @Test
    void getMotorcycleById_wrongOwner_throwsException() {
        User otherUser = User.builder().id(UUID.randomUUID()).build();

        when(motorcycleRepository.findById(motorcycle.getId()))
                .thenReturn(Optional.of(motorcycle));

        assertThrows(ResourceNotFoundException.class,
                () -> motorcycleService.getMotorcycleById(motorcycle.getId(), otherUser.getId()));
    }

    @Test
    void createMotorcycle_savesAndReturns() {
        CreateMotorcycleRequest request = CreateMotorcycleRequest.builder()
                .make("Yamaha")
                .model("NMAX 155")
                .year(2024)
                .currentMileage(0)
                .build();

        when(userRepository.findById(user.getId()))
                .thenReturn(Optional.of(user));
        when(motorcycleRepository.save(any(Motorcycle.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(templateRepository.findByIsSystem(true))
                .thenReturn(List.of());

        MotorcycleResponse response = motorcycleService.createMotorcycle(request, user.getId());

        assertNotNull(response);
        assertEquals("Yamaha", response.getMake());
        assertEquals("NMAX 155", response.getModel());
        assertEquals(0, response.getCurrentMileage());
    }

    @Test
    void updateMileage_updatesCurrentMileage() {
        when(motorcycleRepository.findById(motorcycle.getId()))
                .thenReturn(Optional.of(motorcycle));
        when(motorcycleRepository.save(any(Motorcycle.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        MotorcycleResponse response = motorcycleService.updateMileage(motorcycle.getId(), 6000, user.getId());

        assertNotNull(response);
        assertEquals(6000, response.getCurrentMileage());
    }

    @Test
    void updateMileage_wrongOwner_throwsException() {
        User otherUser = User.builder().id(UUID.randomUUID()).build();

        when(motorcycleRepository.findById(motorcycle.getId()))
                .thenReturn(Optional.of(motorcycle));

        assertThrows(ResourceNotFoundException.class,
                () -> motorcycleService.updateMileage(motorcycle.getId(), 6000, otherUser.getId()));
    }

    @Test
    void deleteMotorcycle_softDeletes() {
        when(motorcycleRepository.findById(motorcycle.getId()))
                .thenReturn(Optional.of(motorcycle));
        when(motorcycleRepository.save(any(Motorcycle.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        motorcycleService.deleteMotorcycle(motorcycle.getId(), user.getId());

        verify(motorcycleRepository, times(1)).save(any(Motorcycle.class));
        assertNotNull(motorcycle.getDeletedAt());
    }
}
