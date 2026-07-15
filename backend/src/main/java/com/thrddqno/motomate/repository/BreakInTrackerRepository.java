package com.thrddqno.motomate.repository;

import com.thrddqno.motomate.entity.BreakInTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BreakInTrackerRepository extends JpaRepository<BreakInTracker, UUID> {
    Optional<BreakInTracker> findByMotorcycleId(UUID motorcycleId);
    boolean existsByMotorcycleId(UUID motorcycleId);
}
