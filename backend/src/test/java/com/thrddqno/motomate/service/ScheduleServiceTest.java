package com.thrddqno.motomate.service;

import com.thrddqno.motomate.dto.request.CreateScheduleRequest;
import com.thrddqno.motomate.dto.request.UpdateScheduleRequest;
import com.thrddqno.motomate.dto.response.ScheduleResponse;
import com.thrddqno.motomate.entity.MaintenanceSchedule;
import com.thrddqno.motomate.entity.MaintenanceTemplate;
import com.thrddqno.motomate.entity.Motorcycle;
import com.thrddqno.motomate.entity.User;
import com.thrddqno.motomate.enums.IntervalType;
import com.thrddqno.motomate.enums.MaintenanceCategory;
import com.thrddqno.motomate.exception.ResourceNotFoundException;
import com.thrddqno.motomate.repository.MaintenanceScheduleRepository;
import com.thrddqno.motomate.repository.MaintenanceTemplateRepository;
import com.thrddqno.motomate.repository.MotorcycleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock
    private MaintenanceScheduleRepository scheduleRepository;

    @Mock
    private MaintenanceTemplateRepository templateRepository;

    @Mock
    private MotorcycleRepository motorcycleRepository;

    @InjectMocks
    private ScheduleService scheduleService;

    private User user;
    private Motorcycle motorcycle;
    private MaintenanceTemplate template;

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
                .currentMileage(5000)
                .isActive(true)
                .build();

        template = MaintenanceTemplate.builder()
                .id(UUID.randomUUID())
                .name("Oil Change")
                .category(MaintenanceCategory.ENGINE)
                .build();
    }

    @Test
    void createSchedule_mileageInterval_calculatesNextDueMileage() {
        CreateScheduleRequest request = CreateScheduleRequest.builder()
                .templateId(template.getId())
                .intervalType(IntervalType.MILEAGE)
                .intervalMileage(3000)
                .build();

        when(motorcycleRepository.findById(motorcycle.getId()))
                .thenReturn(Optional.of(motorcycle));
        when(templateRepository.findById(template.getId()))
                .thenReturn(Optional.of(template));
        when(scheduleRepository.save(any(MaintenanceSchedule.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleResponse response = scheduleService.createSchedule(motorcycle.getId(), request, user.getId());

        assertNotNull(response);
        assertEquals(8000, response.getNextDueMileage()); // 5000 + 3000
        assertNull(response.getNextDueDate());
    }

    @Test
    void createSchedule_dateInterval_calculatesNextDueDate() {
        CreateScheduleRequest request = CreateScheduleRequest.builder()
                .templateId(template.getId())
                .intervalType(IntervalType.DATE)
                .intervalDays(90)
                .build();

        when(motorcycleRepository.findById(motorcycle.getId()))
                .thenReturn(Optional.of(motorcycle));
        when(templateRepository.findById(template.getId()))
                .thenReturn(Optional.of(template));
        when(scheduleRepository.save(any(MaintenanceSchedule.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleResponse response = scheduleService.createSchedule(motorcycle.getId(), request, user.getId());

        assertNotNull(response);
        assertNull(response.getNextDueMileage());
        assertEquals(LocalDate.now().plusDays(90), response.getNextDueDate());
    }

    @Test
    void createSchedule_bothInterval_calculatesBothNextDue() {
        CreateScheduleRequest request = CreateScheduleRequest.builder()
                .templateId(template.getId())
                .intervalType(IntervalType.BOTH)
                .intervalMileage(3000)
                .intervalDays(90)
                .build();

        when(motorcycleRepository.findById(motorcycle.getId()))
                .thenReturn(Optional.of(motorcycle));
        when(templateRepository.findById(template.getId()))
                .thenReturn(Optional.of(template));
        when(scheduleRepository.save(any(MaintenanceSchedule.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleResponse response = scheduleService.createSchedule(motorcycle.getId(), request, user.getId());

        assertNotNull(response);
        assertEquals(8000, response.getNextDueMileage());
        assertEquals(LocalDate.now().plusDays(90), response.getNextDueDate());
    }

    @Test
    void updateSchedule_changeInterval_recalculatesNextDue() {
        MaintenanceSchedule existingSchedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template)
                .intervalType(IntervalType.MILEAGE)
                .intervalMileage(3000)
                .lastServiceMileage(5000)
                .lastServiceDate(LocalDate.now())
                .nextDueMileage(8000)
                .isActive(true)
                .build();

        UpdateScheduleRequest request = UpdateScheduleRequest.builder()
                .intervalMileage(5000)
                .build();

        when(scheduleRepository.findById(existingSchedule.getId()))
                .thenReturn(Optional.of(existingSchedule));
        when(scheduleRepository.save(any(MaintenanceSchedule.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleResponse response = scheduleService.updateSchedule(existingSchedule.getId(), request, user.getId());

        assertNotNull(response);
        assertEquals(10000, response.getNextDueMileage()); // 5000 (lastService) + 5000 (new interval)
    }

    @Test
    void updateSchedule_changeToActive_recalculatesNextDue() {
        MaintenanceSchedule existingSchedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template)
                .intervalType(IntervalType.MILEAGE)
                .intervalMileage(3000)
                .lastServiceMileage(5000)
                .lastServiceDate(LocalDate.now())
                .nextDueMileage(8000)
                .isActive(false)
                .build();

        UpdateScheduleRequest request = UpdateScheduleRequest.builder()
                .isActive(true)
                .build();

        when(scheduleRepository.findById(existingSchedule.getId()))
                .thenReturn(Optional.of(existingSchedule));
        when(scheduleRepository.save(any(MaintenanceSchedule.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ScheduleResponse response = scheduleService.updateSchedule(existingSchedule.getId(), request, user.getId());

        assertTrue(response.getIsActive());
    }

    @Test
    void deleteSchedule_softDeletes() {
        MaintenanceSchedule existingSchedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template)
                .build();

        when(scheduleRepository.findById(existingSchedule.getId()))
                .thenReturn(Optional.of(existingSchedule));
        when(scheduleRepository.save(any(MaintenanceSchedule.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        scheduleService.deleteSchedule(existingSchedule.getId(), user.getId());

        verify(scheduleRepository, times(1)).save(any(MaintenanceSchedule.class));
        assertNotNull(existingSchedule.getDeletedAt());
    }

    @Test
    void getScheduleById_wrongUser_throwsException() {
        User otherUser = User.builder().id(UUID.randomUUID()).build();
        MaintenanceSchedule existingSchedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template)
                .build();

        when(scheduleRepository.findById(existingSchedule.getId()))
                .thenReturn(Optional.of(existingSchedule));

        assertThrows(ResourceNotFoundException.class,
                () -> scheduleService.getScheduleById(existingSchedule.getId(), otherUser.getId()));
    }

    @Test
    void createSchedule_motorcycleNotFound_throwsException() {
        CreateScheduleRequest request = CreateScheduleRequest.builder()
                .templateId(template.getId())
                .intervalType(IntervalType.MILEAGE)
                .intervalMileage(3000)
                .build();

        when(motorcycleRepository.findById(motorcycle.getId()))
                .thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> scheduleService.createSchedule(motorcycle.getId(), request, user.getId()));
    }
}
