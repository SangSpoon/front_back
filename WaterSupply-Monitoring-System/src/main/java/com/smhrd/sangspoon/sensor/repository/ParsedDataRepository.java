package com.smhrd.sangspoon.sensor.repository;

import com.smhrd.sangspoon.sensor.entity.ParsedDataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ParsedDataRepository extends JpaRepository<ParsedDataEntity, Long> {
}
