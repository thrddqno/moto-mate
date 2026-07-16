package com.thrddqno.motomate.repository;

import com.thrddqno.motomate.entity.MaintenanceTemplate;
import com.thrddqno.motomate.enums.MaintenanceCategory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceTemplateRepository extends JpaRepository<MaintenanceTemplate, UUID> {
    List<MaintenanceTemplate> findByIsPublic(Boolean isPublic);
    List<MaintenanceTemplate> findByCategory(MaintenanceCategory category);
    List<MaintenanceTemplate> findByCategoryAndIsPublic(MaintenanceCategory category, Boolean isPublic);
    List<MaintenanceTemplate> findByIsSystem(Boolean isSystem);
    List<MaintenanceTemplate> findByCreatedByUserId(UUID userId);

    @Query("SELECT t FROM MaintenanceTemplate t " +
           "WHERE (t.isPublic = true OR t.createdByUserId = :userId) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:cursorCreatedAt IS NULL OR t.createdAt < :cursorCreatedAt) " +
           "ORDER BY t.createdAt DESC")
    List<MaintenanceTemplate> findVisibleTemplatesKeyset(
            @Param("userId") UUID userId,
            @Param("category") MaintenanceCategory category,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            Pageable pageable);
}
