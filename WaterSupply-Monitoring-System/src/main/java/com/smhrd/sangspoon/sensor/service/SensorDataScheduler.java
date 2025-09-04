package com.smhrd.sangspoon.sensor.service;

import com.smhrd.sangspoon.alert.AlertMetric;
import com.smhrd.sangspoon.alert.service.AlertConfigService;
import com.smhrd.sangspoon.sensor.entity.SensorDataEntity;
import com.smhrd.sangspoon.sensor.entity.ParsedDataEntity;
import com.smhrd.sangspoon.sensor.repository.SensorDataRepository;
import com.smhrd.sangspoon.sensor.repository.ParsedDataRepository;
import com.smhrd.sangspoon.site.entity.SiteEntity;
import com.smhrd.sangspoon.site.repository.SiteRepository;
import com.smhrd.sangspoon.service.EmailAlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class SensorDataScheduler {

    @Autowired private SensorDataRepository sensorDataRepository;
    @Autowired private ParsedDataRepository parsedDataRepository;
    @Autowired private SiteRepository siteRepository;
    @Autowired private SensorDataService sensorDataService;
    @Autowired private EmailAlertService emailAlertService;

    @Autowired private AlertConfigService alertConfigService;

    private final Random random = new Random();
    private boolean isRunning = false;
    private long cumulativeTotal = 0;

    private float previousWaterLevel = 65.0f;
    private float previousChemicalLevel = 45.0f;
    private float previousFlowRate = 25.0f;

    @PostConstruct
    public void init() { start(); }

    @Scheduled(fixedRate = 60000)
    public void generateSensorData() {
        if (!isRunning) return;

        try {
            LocalDateTime now = LocalDateTime.now();
            LocalDateTime currentMinuteStart = now.withSecond(0).withNano(0);
            LocalDateTime nextMinuteStart = currentMinuteStart.plusMinutes(1);

            List<String> siteIds = siteRepository.findAllManagementCodes();
            if (siteIds.isEmpty()) {
                System.out.println("관리번호가 없습니다. 생성 중단.");
            }

            for (String siteId : siteIds) {
                boolean exists = parsedDataRepository.existsBySiteIdAndCreatedAtBetween(
                        siteId, currentMinuteStart, nextMinuteStart);
                if (exists) {
                    System.out.println("이미 데이터 존재합니다.");
                    continue;
                }

                SiteEntity site = siteRepository.getReferenceById(siteId);
                String rawData = generateRandomRawData(siteId);

                SensorDataEntity sensorData = new SensorDataEntity();
                sensorData.setRawData(rawData);
                sensorData.setReceivedAt(LocalDateTime.now());
                sensorData.setSite(site);
                sensorDataRepository.save(sensorData);

                ParsedDataEntity parsed = sensorDataService.parseRawData(rawData, siteId, sensorData.getId());
                parsedDataRepository.save(parsed);

                System.out.println("센서 데이터 생성 완료: " + LocalDateTime.now()
                        + " (siteId: " + siteId + ", parsedId: " + parsed.getId() + ")");
            }

        } catch (Exception e) {
            System.err.println("센서 데이터 생성 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String generateRandomRawData(String siteId) {
        double p = random.nextDouble();

        int motorStatus = random.nextInt(4); // 0..3
        boolean motor1On = (motorStatus & 0x1) != 0;
        boolean motor2On = (motorStatus & 0x2) != 0;
        boolean anyMotorOn = motor1On || motor2On;
        String motorHex = String.format("%02x", motorStatus);

        // 수위 변화
        float waterLevelChange = (p < 0.85)
                ? (random.nextFloat() - 0.5f) * 3.0f
                : (random.nextFloat() - 0.5f) * 35.0f; // 가끔 크게
        float newWaterLevel = clamp(previousWaterLevel + waterLevelChange, 5.0f, 95.0f);
        previousWaterLevel = newWaterLevel;
        String waterHex = String.format("%02x", Math.round(newWaterLevel));

        // 약품 변화
        float chemicalLevelChange = (p < 0.85)
                ? (random.nextFloat() - 0.5f) * 3.0f
                : (random.nextFloat() - 0.5f) * 30.0f;
        float newChemicalLevel = clamp(previousChemicalLevel + chemicalLevelChange, 5.0f, 90.0f);

        if (random.nextDouble() < 0.05) {
            newChemicalLevel = 12.0f + random.nextFloat() * 8.0f; // 12~20
        }
        previousChemicalLevel = newChemicalLevel;
        String chemicalHex = String.format("%02x", Math.round(newChemicalLevel));

        // 유량:
        float newFlowRate;
        if (!anyMotorOn) {
            if (random.nextDouble() < 0.10) {
                newFlowRate = 5.0f + random.nextFloat() * 15.0f; // 5~20 (누설 → 모터불량 조건)
            } else {
                newFlowRate = random.nextFloat() * 0.8f; // 0~0.8 ≈ 0
            }
        } else {
            if (random.nextDouble() < 0.05) {
                newFlowRate = random.nextFloat() * 0.8f; // ≈0
            } else {
                float delta = (random.nextFloat() - 0.5f) * 4.0f;
                newFlowRate = clamp(previousFlowRate + delta, 8.0f, 45.0f);
            }
        }
        previousFlowRate = newFlowRate;
        String flowRateHex = floatToHex(newFlowRate);

        // 누적량
        cumulativeTotal += Math.round(Math.max(0, newFlowRate));
        String totalAmountHex = String.format("%08x", cumulativeTotal);

        // === 설정 기반 이상 감지 & 메일 ===
        try {
            if (alertConfigService.isUiEnabled() && alertConfigService.isSiteEnabled(siteId)) {
                List<AlertMetric> triggered = new ArrayList<>();

                if (alertConfigService.isMetricChecked(siteId, AlertMetric.HIGH_WATER) && newWaterLevel > 80f)
                    triggered.add(AlertMetric.HIGH_WATER);

                if (alertConfigService.isMetricChecked(siteId, AlertMetric.LOW_WATER) && newWaterLevel < 25f)
                    triggered.add(AlertMetric.LOW_WATER);

                if (alertConfigService.isMetricChecked(siteId, AlertMetric.CHEMICAL) && newChemicalLevel < 20f)
                    triggered.add(AlertMetric.CHEMICAL);

                if (alertConfigService.isMetricChecked(siteId, AlertMetric.MOTOR1_STOP) && !motor1On)
                    triggered.add(AlertMetric.MOTOR1_STOP);

                if (alertConfigService.isMetricChecked(siteId, AlertMetric.MOTOR2_STOP) && !motor2On)
                    triggered.add(AlertMetric.MOTOR2_STOP);

                if (alertConfigService.isMetricChecked(siteId, AlertMetric.MOTOR_FAULT)) {
                    boolean flowNearZero = newFlowRate < 1.0f;
                    boolean flowPositive = newFlowRate > 1.0f;
                    boolean motorFault = (anyMotorOn && flowNearZero) || (!anyMotorOn && flowPositive);
                    if (motorFault) triggered.add(AlertMetric.MOTOR_FAULT);
                }

                if (!triggered.isEmpty()) {
                    emailAlertService.sendAnomalyAlert(
                            alertConfigService.getRecipientsOrDefault(),
                            siteId,
                            triggered,
                            newWaterLevel,
                            newChemicalLevel,
                            newFlowRate,
                            motor1On,
                            motor2On
                    );
                }
            }
        } catch (Exception e) {
            System.err.println("알림 판정/전송 중 오류: " + e.getMessage());
            e.printStackTrace();
        }

        String rawData = String.format("%sWATER%sCHEMICAL%sMAIN%s%s%s",
                siteId, waterHex, chemicalHex, motorHex, flowRateHex, totalAmountHex);

        System.out.println("Generated Raw Data: " + rawData);
        System.out.println("  Water: " + waterHex + " (" + newWaterLevel + "%)");
        System.out.println("  Chemical: " + chemicalHex + " (" + newChemicalLevel + "%)");
        System.out.println("  Motor: " + motorHex + " (m1On=" + motor1On + ", m2On=" + motor2On + ")");
        System.out.println("  Flow Rate: " + flowRateHex + " (" + newFlowRate + " L/min)");
        System.out.println("  Total Amount: " + totalAmountHex + " (" + cumulativeTotal + ")");

        return rawData;
    }

    private float clamp(float v, float lo, float hi) {
        return Math.max(lo, Math.min(hi, v));
    }

    private String floatToHex(float value) {
        try {
            if (value < 0 || value > 1000) value = 25.0f;
            int intBits = Float.floatToIntBits(value);
            String hex = String.format("%08x", intBits);
            return hex.substring(6, 8) + hex.substring(4, 6) + hex.substring(2, 4) + hex.substring(0, 2);
        } catch (Exception e) {
            return "00000000";
        }
    }

    public void start() {
        isRunning = true;
        previousWaterLevel = 70.0f + (random.nextFloat() - 0.5f) * 15.0f;
        previousChemicalLevel = 40.0f + (random.nextFloat() - 0.5f) * 20.0f;
        previousFlowRate = 25.0f + (random.nextFloat() - 0.5f) * 10.0f;
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

    public boolean isRunning() { return isRunning; }

    public void resetToHighWaterLevel() {
        previousWaterLevel = 70.0f + (random.nextFloat() - 0.5f) * 15.0f;
        System.out.println("수위 강제 리셋: " + previousWaterLevel + "%");
    }
}
