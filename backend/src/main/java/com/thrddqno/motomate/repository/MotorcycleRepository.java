package com.thrddqno.motomate.repository;

import com.thrddqno.motomate.entity.Motorcycle;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface MotorcycleRepository extends JpaRepository<Motorcycle, UUID> {
    List<Motorcycle> findByUserId(UUID userId);
    List<Motorcycle> findByUserIdAndIsActive(UUID userId, Boolean isActive);

    @Query("SELECT m FROM Motorcycle m " +
           "WHERE m.user.id = :userId " +
           "ORDER BY m.createdAt DESC")
    List<Motorcycle> findByUserIdKeyset(
            @Param("userId") UUID userId,
            Pageable pageable);

    @Query("SELECT m FROM Motorcycle m " +
           "WHERE m.user.id = :userId " +
           "AND m.createdAt < :cursorCreatedAt " +
           "ORDER BY m.createdAt DESC")
    List<Motorcycle> findByUserIdKeysetAfter(
            @Param("userId") UUID userId,
            @Param("cursorCreatedAt") Instant cursorCreatedAt,
            Pageable pageable);
}
