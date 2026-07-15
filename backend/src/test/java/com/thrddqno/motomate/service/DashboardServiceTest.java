package com.thrddqno.motomate.service;

import com.thrddqno.motomate.dto.response.DashboardItem;
import com.thrddqno.motomate.dto.response.DashboardResponse;
import com.thrddqno.motomate.entity.MaintenanceSchedule;
import com.thrddqno.motomate.entity.MaintenanceTemplate;
import com.thrddqno.motomate.entity.Motorcycle;
import com.thrddqno.motomate.entity.User;
import com.thrddqno.motomate.enums.IntervalType;
import com.thrddqno.motomate.enums.MaintenanceCategory;
import com.thrddqno.motomate.repository.MaintenanceScheduleRepository;
import com.thrddqno.motomate.repository.MotorcycleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private MotorcycleRepository motorcycleRepository;

    @Mock
    private MaintenanceScheduleRepository scheduleRepository;

    @InjectMocks
    private DashboardService dashboardService;

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
                .name("My Honda")
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

        ReflectionTestUtils.setField(dashboardService, "dueSoonDays", 7);
    }

    @Test
    void getDashboard_overdueMileageSchedule_returnsOverdue() {
        MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template)
                .intervalType(IntervalType.MILEAGE)
                .intervalMileage(3000)
                .nextDueMileage(4000) // Overdue (current is 5000)
                .isActive(true)
                .build();

        when(motorcycleRepository.findByUserIdAndIsActive(user.getId(), true))
                .thenReturn(List.of(motorcycle));
        when(scheduleRepository.findByMotorcycleIdAndIsActive(motorcycle.getId(), true))
                .thenReturn(List.of(schedule));

        DashboardResponse response = dashboardService.getDashboard(user.getId());

        assertNotNull(response);
        assertEquals(1, response.getOverdue().size());
        assertEquals(0, response.getDueSoon().size());
        assertEquals(0, response.getUpcoming().size());

        DashboardItem item = response.getOverdue().get(0);
        assertEquals("Oil Change", item.getTemplateName());
        assertEquals("My Honda", item.getMotorcycleName());
        assertEquals("OVERDUE", item.getStatus());
    }

    @Test
    void getDashboard_dueSoonMileageSchedule_returnsDueSoon() {
        MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template)
                .intervalType(IntervalType.MILEAGE)
                .intervalMileage(3000)
                .nextDueMileage(5500) // Due soon (500km left, threshold is 1000km)
                .isActive(true)
                .build();

        when(motorcycleRepository.findByUserIdAndIsActive(user.getId(), true))
                .thenReturn(List.of(motorcycle));
        when(scheduleRepository.findByMotorcycleIdAndIsActive(motorcycle.getId(), true))
                .thenReturn(List.of(schedule));

        DashboardResponse response = dashboardService.getDashboard(user.getId());

        assertEquals(0, response.getOverdue().size());
        assertEquals(1, response.getDueSoon().size());
        assertEquals(0, response.getUpcoming().size());
        assertEquals("DUE_SOON", response.getDueSoon().get(0).getStatus());
    }

    @Test
    void getDashboard_upcomingMileageSchedule_returnsUpcoming() {
        MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template)
                .intervalType(IntervalType.MILEAGE)
                .intervalMileage(3000)
                .nextDueMileage(7000) // Upcoming (2000km left)
                .isActive(true)
                .build();

        when(motorcycleRepository.findByUserIdAndIsActive(user.getId(), true))
                .thenReturn(List.of(motorcycle));
        when(scheduleRepository.findByMotorcycleIdAndIsActive(motorcycle.getId(), true))
                .thenReturn(List.of(schedule));

        DashboardResponse response = dashboardService.getDashboard(user.getId());

        assertEquals(0, response.getOverdue().size());
        assertEquals(0, response.getDueSoon().size());
        assertEquals(1, response.getUpcoming().size());
        assertEquals("UPCOMING", response.getUpcoming().get(0).getStatus());
    }

    @Test
    void getDashboard_overdueDateSchedule_returnsOverdue() {
        MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template)
                .intervalType(IntervalType.DATE)
                .intervalDays(90)
                .nextDueDate(LocalDate.now().minusDays(10)) // Overdue
                .isActive(true)
                .build();

        when(motorcycleRepository.findByUserIdAndIsActive(user.getId(), true))
                .thenReturn(List.of(motorcycle));
        when(scheduleRepository.findByMotorcycleIdAndIsActive(motorcycle.getId(), true))
                .thenReturn(List.of(schedule));

        DashboardResponse response = dashboardService.getDashboard(user.getId());

        assertEquals(1, response.getOverdue().size());
        assertEquals("OVERDUE", response.getOverdue().get(0).getStatus());
    }

    @Test
    void getDashboard_dueSoonDateSchedule_returnsDueSoon() {
        MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template)
                .intervalType(IntervalType.DATE)
                .intervalDays(90)
                .nextDueDate(LocalDate.now().plusDays(5)) // Due soon (5 days left, threshold is 7)
                .isActive(true)
                .build();

        when(motorcycleRepository.findByUserIdAndIsActive(user.getId(), true))
                .thenReturn(List.of(motorcycle));
        when(scheduleRepository.findByMotorcycleIdAndIsActive(motorcycle.getId(), true))
                .thenReturn(List.of(schedule));

        DashboardResponse response = dashboardService.getDashboard(user.getId());

        assertEquals(0, response.getOverdue().size());
        assertEquals(1, response.getDueSoon().size());
        assertEquals("DUE_SOON", response.getDueSoon().get(0).getStatus());
    }

    @Test
    void getDashboard_bothInterval_mileageOverdueDateOk_returnsOverdue() {
        MaintenanceSchedule schedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template)
                .intervalType(IntervalType.BOTH)
                .intervalMileage(3000)
                .intervalDays(90)
                .nextDueMileage(4000) // Overdue by mileage
                .nextDueDate(LocalDate.now().plusDays(50)) // Not overdue by date
                .isActive(true)
                .build();

        when(motorcycleRepository.findByUserIdAndIsActive(user.getId(), true))
                .thenReturn(List.of(motorcycle));
        when(scheduleRepository.findByMotorcycleIdAndIsActive(motorcycle.getId(), true))
                .thenReturn(List.of(schedule));

        DashboardResponse response = dashboardService.getDashboard(user.getId());

        assertEquals(1, response.getOverdue().size());
        assertEquals("OVERDUE", response.getOverdue().get(0).getStatus());
    }

    @Test
    void getDashboard_multipleSchedules_categorizesCorrectly() {
        MaintenanceSchedule overdueSchedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template)
                .intervalType(IntervalType.MILEAGE)
                .intervalMileage(3000)
                .nextDueMileage(4000) // Overdue
                .isActive(true)
                .build();

        MaintenanceTemplate template2 = MaintenanceTemplate.builder()
                .id(UUID.randomUUID())
                .name("Chain Lube")
                .category(MaintenanceCategory.CHAIN)
                .build();

        MaintenanceSchedule upcomingSchedule = MaintenanceSchedule.builder()
                .id(UUID.randomUUID())
                .motorcycle(motorcycle)
                .template(template2)
                .intervalType(IntervalType.MILEAGE)
                .intervalMileage(500)
                .nextDueMileage(7000) // Upcoming
                .isActive(true)
                .build();

        when(motorcycleRepository.findByUserIdAndIsActive(user.getId(), true))
                .thenReturn(List.of(motorcycle));
        when(scheduleRepository.findByMotorcycleIdAndIsActive(motorcycle.getId(), true))
                .thenReturn(List.of(overdueSchedule, upcomingSchedule));

        DashboardResponse response = dashboardService.getDashboard(user.getId());

        assertEquals(1, response.getOverdue().size());
        assertEquals(0, response.getDueSoon().size());
        assertEquals(1, response.getUpcoming().size());
        assertEquals(2, response.getTotalActiveSchedules());
        assertEquals(1, response.getTotalBikes());
    }
}
