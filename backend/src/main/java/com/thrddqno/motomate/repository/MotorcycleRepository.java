package com.thrddqno.motomate.repository;

import com.thrddqno.motomate.entity.Motorcycle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MotorcycleRepository extends JpaRepository<Motorcycle, UUID> {
    List<Motorcycle> findByUserId(UUID userId);
    List<Motorcycle> findByUserIdAndIsActive(UUID userId, Boolean isActive);
}
