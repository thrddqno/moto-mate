package com.thrddqno.motomate.repository;

import com.thrddqno.motomate.entity.MaintenanceTemplate;
import com.thrddqno.motomate.enums.MaintenanceCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaintenanceTemplateRepository extends JpaRepository<MaintenanceTemplate, UUID> {
    List<MaintenanceTemplate> findByIsPublic(Boolean isPublic);
    List<MaintenanceTemplate> findByCategory(MaintenanceCategory category);
    List<MaintenanceTemplate> findByCategoryAndIsPublic(MaintenanceCategory category, Boolean isPublic);
    List<MaintenanceTemplate> findByIsSystem(Boolean isSystem);
    List<MaintenanceTemplate> findByCreatedByUserId(UUID userId);
}
