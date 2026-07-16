package com.thrddqno.motomate.repository;

import com.thrddqno.motomate.entity.MaintenanceSchedule;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceScheduleRepository extends JpaRepository<MaintenanceSchedule, UUID> {
    List<MaintenanceSchedule> findByMotorcycleId(UUID motorcycleId);
    List<MaintenanceSchedule> findByMotorcycleIdAndIsActive(UUID motorcycleId, Boolean isActive);
    List<MaintenanceSchedule> findByIsActive(Boolean isActive);

    @Query("SELECT s FROM MaintenanceSchedule s " +
           "WHERE s.motorcycle.id = :motorcycleId " +
           "AND (:cursorCreatedAt IS NULL OR s.createdAt < :cursorCreatedAt) " +
           "ORDER BY s.createdAt DESC")
    List<MaintenanceSchedule> findByMotorcycleIdKeyset(
            @Param("motorcycleId") UUID motorcycleId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            Pageable pageable);
}
