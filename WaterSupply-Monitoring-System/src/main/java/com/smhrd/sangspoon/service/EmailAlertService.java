package com.smhrd.sangspoon.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class EmailAlertService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${alert.email.enabled:false}")
    private boolean emailEnabled;

    @Value("${alert.email.recipients:}")
    private String recipients;

    public void sendLargeChangeAlert(String siteId, float waterLevelChange, 
                                   float chemicalLevelChange, float flowRateChange,
                                   float newWaterLevel, float newChemicalLevel, float newFlowRate) {
        
        if (!emailEnabled || recipients.isEmpty()) {
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            
            // 보낸 사람 주소 설정 (네이버 계정과 동일해야 함)
            message.setFrom("lobsterbuger@naver.com");
            
            // 어떤 센서에서 큰 변화가 발생했는지 확인
            List<String> alertReasons = new ArrayList<>();
            if (Math.abs(waterLevelChange) > 10) {
                alertReasons.add("수위");
            }
            if (Math.abs(chemicalLevelChange) > 10) {
                alertReasons.add("약품");
            }
            if (Math.abs(flowRateChange) > 10) {
                alertReasons.add("유량");
            }
            
            // 제목에 알림 이유 포함
            String alertReason = String.join(", ", alertReasons);
            message.setSubject("🚨 긴급 알림: 현장 " + siteId + " - " + alertReason + " 이상 감지");
            
            // 내용 설정 (알림 이유 강조)
            String content = String.format(
                "현장 %s에서 %s 이상이 감지되었습니다!\n\n" +
                "발생 시간: %s\n" +
                "현장 ID: %s\n" +
                "알림 사유: %s\n\n" +
                "상세 변화량:\n" +
                "%s" +
                "%s" +
                "%s" +
                "\n즉시 확인이 필요합니다.\n\n" +
                "이 메일은 자동으로 발송되었습니다.",
                siteId,
                alertReason,
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                siteId,
                alertReason,
                getChangeDescription("수위", waterLevelChange, newWaterLevel, "%", Math.abs(waterLevelChange) > 10),
                getChangeDescription("약품", chemicalLevelChange, newChemicalLevel, "%", Math.abs(chemicalLevelChange) > 10),
                getChangeDescription("유량", flowRateChange, newFlowRate, "L/min", Math.abs(flowRateChange) > 10)
            );
            
            message.setText(content);
            message.setTo(recipients);
            
            // 이메일 전송
            mailSender.send(message);
            
            System.out.println("🚨 이메일 알림 전송 완료: " + recipients + " (원인: " + alertReason + ")");
            
        } catch (Exception e) {
            System.err.println("이메일 알림 전송 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // 센서별 변화 설명 생성
    private String getChangeDescription(String sensorName, float change, float current, String unit, boolean isAlert) {
        if (isAlert) {
            return String.format("🚨 %s: %.1f%s (현재: %.1f%s) ← 큰 변화 감지!\n", 
                               sensorName, change, unit, current, unit);
        } else {
            return String.format("   %s: %.1f%s (현재: %.1f%s)\n", 
                               sensorName, change, unit, current, unit);
        }
    }
}
