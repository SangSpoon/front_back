package com.smhrd.sangspoon.sensor.service;

import com.smhrd.sangspoon.sensor.entity.SensorDataEntity;
import com.smhrd.sangspoon.sensor.entity.ParsedDataEntity;
import com.smhrd.sangspoon.sensor.repository.SensorDataRepository;
import com.smhrd.sangspoon.sensor.repository.ParsedDataRepository;
import com.smhrd.sangspoon.site.entity.SiteEntity;
import com.smhrd.sangspoon.site.repository.SiteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.Random;

@Service
public class SensorDataScheduler {

    @Autowired
    private SensorDataRepository sensorDataRepository;
    
    @Autowired
    private ParsedDataRepository parsedDataRepository;
    
    @Autowired
    private SiteRepository siteRepository;
    
    @Autowired
    private SensorDataService sensorDataService;

    private final Random random = new Random();
    private boolean isRunning = false;
    private long cumulativeTotal = 0;
    
    // 이전 값들을 저장하여 점진적 변화 생성
    private float previousWaterLevel = 50.0f;
    private float previousChemicalLevel = 40.0f;
    private float previousFlowRate = 25.0f;

    // 애플리케이션 시작 시 자동으로 스케줄러 시작
    @PostConstruct
    public void init() {
        start();
    }

    @Scheduled(fixedRate = 60000) // 1분마다 실행
    public void generateSensorData() {
        if (!isRunning) return;
        
        try {
            // 현장 정보 가져오기 (관리번호 "001000")
            SiteEntity site = siteRepository.findById("001000")
                .orElse(null); // null 허용
            
            // 랜덤 raw data 생성
            String rawData = generateRandomRawData();
            
            // SensorDataEntity 생성 및 저장
            SensorDataEntity sensorData = new SensorDataEntity();
            sensorData.setRawData(rawData);
            sensorData.setReceivedAt(LocalDateTime.now());
            sensorData.setSite(site); // site가 null이어도 저장
            sensorDataRepository.save(sensorData); // 항상 저장하여 ID 생성
            
            // raw data 파싱하여 ParsedDataEntity 생성
            String siteId = site != null ? site.getManagementCode() : "001000";
            ParsedDataEntity parsedData = sensorDataService.parseRawData(rawData, siteId, sensorData.getId());
            parsedDataRepository.save(parsedData);
            
            System.out.println("센서 데이터 생성 완료: " + LocalDateTime.now() + " (ID: " + parsedData.getId() + ")");
            
        } catch (Exception e) {
            System.err.println("센서 데이터 생성 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String generateRandomRawData() {
        // 물탱크 수위 (이전 값 기반 점진적 변화) - 현실적인 범위로 조정
        float waterLevelChange = (random.nextFloat() - 0.5f) * 3.0f; // -1.5 ~ +1.5
        
        // 기존 값이 너무 낮으면 강제로 높은 범위로 조정
        if (previousWaterLevel < 50.0f) {
            previousWaterLevel = 70.0f + (random.nextFloat() - 0.5f) * 10.0f; // 65-75 범위
        }
        
        float newWaterLevel = Math.max(50.0f, Math.min(85.0f, previousWaterLevel + waterLevelChange));
        previousWaterLevel = newWaterLevel;
        String waterHex = String.format("%02x", Math.round(newWaterLevel));
        
        // 약품 레벨 (이전 값 기반 점진적 변화)
        float chemicalLevelChange = (random.nextFloat() - 0.5f) * 3.0f; // -1.5 ~ +1.5
        float newChemicalLevel = Math.max(10.0f, Math.min(80.0f, previousChemicalLevel + chemicalLevelChange));
        previousChemicalLevel = newChemicalLevel;
        String chemicalHex = String.format("%02x", Math.round(newChemicalLevel));
        
        // 유량 (이전 값 기반 점진적 변화, 현실적인 범위)
        float flowRateChange = (random.nextFloat() - 0.5f) * 2.0f; // -1.0 ~ +1.0 L/min
        float newFlowRate = Math.max(5.0f, Math.min(45.0f, previousFlowRate + flowRateChange));
        previousFlowRate = newFlowRate;
        String flowRateHex = floatToHex(newFlowRate);
        
        // 모터 상태 (랜덤)
        int motorStatus = random.nextInt(4); // 0, 1, 2, 3
        String motorHex = String.format("%02x", motorStatus);
        
        // 누적 총량 (점진적 증가) - 분당 유량을 그대로 누적
        cumulativeTotal += Math.round(newFlowRate);
        String totalAmountHex = String.format("%08x", cumulativeTotal);
        
        // Raw data 문자열 조합
        String rawData = String.format("001000WATER%sCHEMICAL%sMAIN%s%s%s", 
            waterHex, chemicalHex, motorHex, flowRateHex, totalAmountHex);
        
        // 디버깅을 위한 로그
        System.out.println("Generated Raw Data: " + rawData);
        System.out.println("  Water: " + waterHex + " (" + newWaterLevel + "%)");
        System.out.println("  Chemical: " + chemicalHex + " (" + newChemicalLevel + "%)");
        System.out.println("  Motor: " + motorHex + " (" + motorStatus + ")");
        System.out.println("  Flow Rate: " + flowRateHex + " (" + newFlowRate + " L/min)");
        System.out.println("  Total Amount: " + totalAmountHex + " (" + cumulativeTotal + ")");
        
        return rawData;
    }

    // float를 hex로 변환 (Little Endian)
    private String floatToHex(float value) {
        try {
            // 값 범위 체크
            if (value < 0 || value > 1000) {
                value = 25.0f; // 기본값
            }
            
            int intBits = Float.floatToIntBits(value);
            String hex = String.format("%08x", intBits);
            
            // Little Endian으로 변환 (올바른 순서)
            return hex.substring(6, 8) + hex.substring(4, 6) + 
                   hex.substring(2, 4) + hex.substring(0, 2);
        } catch (Exception e) {
            // 오류 시 기본값 반환
            return "00000000";
        }
    }

    public void start() {
        isRunning = true;
        // 이전 값들을 현실적인 초기값으로 리셋
        previousWaterLevel = 70.0f + (random.nextFloat() - 0.5f) * 15.0f; // 62.5-77.5 범위
        previousChemicalLevel = 40.0f + (random.nextFloat() - 0.5f) * 20.0f; // 30-50 범위
        previousFlowRate = 25.0f + (random.nextFloat() - 0.5f) * 10.0f; // 20-30 범위
        
        // cumulativeTotal 초기화
        cumulativeTotal = 0;
        
        System.out.println("센서 데이터 생성 시작됨");
        System.out.println("초기 수위: " + previousWaterLevel + "%");
        System.out.println("초기 약품: " + previousChemicalLevel + "%");
        System.out.println("초기 유량: " + previousFlowRate + " L/min");
    }

    public void stop() {
        isRunning = false;
        System.out.println("센서 데이터 생성 중지됨");
    }

    public boolean isRunning() {
        return isRunning;
    }
    
    // 강제로 높은 수위로 리셋
    public void resetToHighWaterLevel() {
        previousWaterLevel = 70.0f + (random.nextFloat() - 0.5f) * 15.0f; // 62.5-77.5 범위
        System.out.println("수위 강제 리셋: " + previousWaterLevel + "%");
    }
}
