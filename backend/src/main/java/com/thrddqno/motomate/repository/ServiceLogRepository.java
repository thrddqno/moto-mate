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
           "AND m.user.id = :userId")
    Page<ServiceLog> findByMotorcycleIdAndUserId(
            @Param("motorcycleId") UUID motorcycleId,
            @Param("userId") UUID userId,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "JOIN sl.schedule s " +
           "JOIN s.motorcycle m " +
           "WHERE sl.motorcycle.id = :motorcycleId " +
           "AND m.user.id = :userId " +
           "AND LOWER(s.template.name) LIKE :templateName")
    Page<ServiceLog> findByMotorcycleIdAndUserIdWithTemplateName(
            @Param("motorcycleId") UUID motorcycleId,
            @Param("userId") UUID userId,
            @Param("templateName") String templateName,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.id = :motorcycleId " +
           "AND sl.motorcycle.user.id = :userId " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByMotorcycleIdKeyset(
            @Param("motorcycleId") UUID motorcycleId,
            @Param("userId") UUID userId,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.id = :motorcycleId " +
           "AND sl.motorcycle.user.id = :userId " +
           "AND LOWER(sl.template.name) LIKE :templateName " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByMotorcycleIdKeysetWithTemplateName(
            @Param("motorcycleId") UUID motorcycleId,
            @Param("userId") UUID userId,
            @Param("templateName") String templateName,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.id = :motorcycleId " +
           "AND sl.motorcycle.user.id = :userId " +
           "AND sl.createdAt < :cursorCreatedAt " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByMotorcycleIdKeysetAfter(
            @Param("motorcycleId") UUID motorcycleId,
            @Param("userId") UUID userId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.id = :motorcycleId " +
           "AND sl.motorcycle.user.id = :userId " +
           "AND LOWER(sl.template.name) LIKE :templateName " +
           "AND sl.createdAt < :cursorCreatedAt " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByMotorcycleIdKeysetWithTemplateNameAfter(
            @Param("motorcycleId") UUID motorcycleId,
            @Param("userId") UUID userId,
            @Param("templateName") String templateName,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.user.id = :userId " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByUserIdKeyset(
            @Param("userId") UUID userId,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.user.id = :userId " +
           "AND sl.motorcycle.id = :motorcycleId " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByUserIdAndMotorcycleIdKeyset(
            @Param("userId") UUID userId,
            @Param("motorcycleId") UUID motorcycleId,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.user.id = :userId " +
           "AND LOWER(sl.template.name) LIKE :templateName " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByUserIdKeysetWithTemplateName(
            @Param("userId") UUID userId,
            @Param("templateName") String templateName,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.user.id = :userId " +
           "AND sl.motorcycle.id = :motorcycleId " +
           "AND LOWER(sl.template.name) LIKE :templateName " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByUserIdAndMotorcycleIdKeysetWithTemplateName(
            @Param("userId") UUID userId,
            @Param("motorcycleId") UUID motorcycleId,
            @Param("templateName") String templateName,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.user.id = :userId " +
           "AND sl.createdAt < :cursorCreatedAt " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByUserIdKeysetAfter(
            @Param("userId") UUID userId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.user.id = :userId " +
           "AND sl.motorcycle.id = :motorcycleId " +
           "AND sl.createdAt < :cursorCreatedAt " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByUserIdAndMotorcycleIdKeysetAfter(
            @Param("userId") UUID userId,
            @Param("motorcycleId") UUID motorcycleId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.user.id = :userId " +
           "AND LOWER(sl.template.name) LIKE :templateName " +
           "AND sl.createdAt < :cursorCreatedAt " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByUserIdKeysetWithTemplateNameAfter(
            @Param("userId") UUID userId,
            @Param("templateName") String templateName,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            Pageable pageable);

    @Query("SELECT sl FROM ServiceLog sl " +
           "WHERE sl.motorcycle.user.id = :userId " +
           "AND sl.motorcycle.id = :motorcycleId " +
           "AND LOWER(sl.template.name) LIKE :templateName " +
           "AND sl.createdAt < :cursorCreatedAt " +
           "ORDER BY sl.createdAt DESC")
    List<ServiceLog> findByUserIdAndMotorcycleIdKeysetWithTemplateNameAfter(
            @Param("userId") UUID userId,
            @Param("motorcycleId") UUID motorcycleId,
            @Param("templateName") String templateName,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            Pageable pageable);
}
