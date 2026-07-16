package com.thrddqno.motomate.repository;

import com.thrddqno.motomate.entity.ServiceLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceLogRepository extends JpaRepository<ServiceLog, UUID> {
    List<ServiceLog> findByMotorcycleId(UUID motorcycleId);
    List<ServiceLog> findByScheduleId(UUID scheduleId);

    @Query("SELECT sl FROM ServiceLog sl " +
           "JOIN sl.schedule s " +
           "JOIN s.motorcycle m " +
           "WHERE sl.motorcycle.id = :motorcycleId " +
           "AND m.user.id = :userId " +
           "AND (:templateName IS NULL OR s.template.name LIKE %:templateName%)")
    Page<ServiceLog> findByMotorcycleIdAndUserIdWithFilter(
            @Param("motorcycleId") UUID motorcycleId,
            @Param("userId") UUID userId,
            @Param("templateName") String templateName,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.id = :motorcycleId " +
           "AND sl.motorcycle.user.id = :userId " +
           "AND (:templateName IS NULL OR LOWER(sl.template.name) LIKE LOWER(CONCAT('%', :templateName, '%'))) " +
           "AND (:cursorCreatedAt IS NULL OR sl.createdAt < :cursorCreatedAt) " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByMotorcycleIdKeyset(
            @Param("motorcycleId") UUID motorcycleId,
            @Param("userId") UUID userId,
            @Param("templateName") String templateName,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.user.id = :userId " +
           "AND (:motorcycleId IS NULL OR sl.motorcycle.id = :motorcycleId) " +
           "AND (:templateName IS NULL OR LOWER(sl.template.name) LIKE LOWER(CONCAT('%', :templateName, '%'))) " +
           "AND (:cursorCreatedAt IS NULL OR sl.createdAt < :cursorCreatedAt) " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByUserIdKeyset(
            @Param("userId") UUID userId,
            @Param("motorcycleId") UUID motorcycleId,
            @Param("templateName") String templateName,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            Pageable pageable);
}
