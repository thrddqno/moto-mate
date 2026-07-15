package com.thrddqno.motomate.repository;

import com.thrddqno.motomate.entity.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, UUID> {
    List<MaintenanceSchedule> findByMotorcycleId(UUID motorcycleId);
    List<MaintenanceSchedule> findByMotorcycleIdAndIsActive(UUID motorcycleId, Boolean isActive);
    List<MaintenanceSchedule> findByIsActive(Boolean isActive);
}
