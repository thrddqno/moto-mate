package com.thrddqno.motomate.repository;

import com.thrddqno.motomate.entity.ServiceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceLogRepository extends JpaRepository<ServiceLog, UUID> {
    List<ServiceLog> findByMotorcycleId(UUID motorcycleId);
    List<ServiceLog> findByScheduleId(UUID scheduleId);
}
