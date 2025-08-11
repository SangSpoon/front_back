package com.smhrd.sangspoon.sensor.repository;

import com.smhrd.sangspoon.sensor.entity.ParsedDataEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ParsedDataRepository extends JpaRepository<ParsedDataEntity, Long> {
    
    // 특정 현장의 센서 데이터를 생성 시간 역순으로 조회
    List<ParsedDataEntity> findBySiteIdOrderByCreatedAtDesc(String siteId);
    
    // 특정 현장의 최신 센서 데이터 조회
    ParsedDataEntity findFirstBySiteIdOrderByCreatedAtDesc(String siteId);
    
    // 모든 센서 데이터를 생성 시간 역순으로 조회
    List<ParsedDataEntity> findAllByOrderByCreatedAtDesc();
}
