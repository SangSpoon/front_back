package com.smhrd.sangspoon.service;

import com.smhrd.sangspoon.alert.AlertMetric;
import jakarta.annotation.PostConstruct;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailAlertService {

    private final JavaMailSender mailSender;

    public EmailAlertService(JavaMailSender mailSender) { this.mailSender = mailSender; }

    @Value("${spring.mail.username}") private String fromAddress;
    @Value("${alert.email.enabled:false}") private boolean emailEnabled;
    @Value("${alert.email.recipients:}") private String defaultRecipients;

    @PostConstruct
    void init() {
        System.out.println("[EmailAlertService] from=" + fromAddress + ", enabled=" + emailEnabled);
    }

    public void sendGeneric(String to, String subject, String html, String text) throws Exception {
        if (!emailEnabled) return;
        String[] recipients = parseRecipients((to == null || to.isBlank()) ? defaultRecipients : to);
        if (recipients.length == 0) throw new IllegalArgumentException("수신자(to)가 비어있습니다.");

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(
                message, MimeMessageHelper.MULTIPART_MODE_NO, StandardCharsets.UTF_8.name()
        );
        helper.setFrom(new InternetAddress(fromAddress, "상수도 모니터 알림", StandardCharsets.UTF_8.name()));
        helper.setTo(recipients);
        helper.setSubject(subject);

        boolean isHtml = html != null && !html.isBlank();
        String body = isHtml ? html : (text == null ? "" : text);
        helper.setText(body, isHtml);

        mailSender.send(message);
    }

    // 설정 기반 이상 알림
    public void sendAnomalyAlert(String toRecipients,
                                 String siteId,
                                 List<AlertMetric> triggeredMetrics,
                                 float waterLevel,
                                 float chemicalLevel,
                                 float flowRate,
                                 boolean motor1On,
                                 boolean motor2On) {
        if (!emailEnabled) return;

        try {
            String metricKorean = triggeredMetrics.stream()
                    .map(this::metricToKorean)
                    .collect(Collectors.joining(", "));

            String subject = "🚨 이상값 감지: 현장 " + siteId + " - " + metricKorean;

            String html = """
                <h2>현장 %s에서 <span style="color:#d00">%s</span> 이상이 감지되었습니다.</h2>
                <p><b>발생 시간:</b> %s</p>
                <p><b>현장 ID:</b> %s</p>
                <p><b>감지 항목:</b> %s</p>
                <h3>현재 측정값</h3>
                <ul>
                  <li>수위: <b>%.1f%%</b> (임계: 고수위 &gt; 80, 저수위 &lt; 25)</li>
                  <li>약품: <b>%.1f%%</b> (임계: &lt; 20)</li>
                  <li>유량: <b>%.1f L/min</b></li>
                  <li>모터1: %s</li>
                  <li>모터2: %s</li>
                </ul>
                <p style="color:#888;font-size:12px">이 메일은 자동 발송되었습니다.</p>
            """.formatted(
                    siteId,
                    metricKorean,
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                    siteId,
                    metricKorean,
                    waterLevel,
                    chemicalLevel,
                    flowRate,
                    motor1On ? "ON" : "OFF",
                    motor2On ? "ON" : "OFF"
            );

            sendGeneric(toRecipients, subject, html, null);
            System.out.println("🚨 이상값 이메일 전송 완료: to=" + toRecipients + ", site=" + siteId + ", metrics=" + metricKorean);
        } catch (Exception e) {
            System.err.println("이상값 이메일 전송 실패: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String metricToKorean(AlertMetric m) {
        return switch (m) {
            case HIGH_WATER -> "고수위";
            case LOW_WATER -> "저수위";
            case CHEMICAL -> "약품";
            case MOTOR1_STOP -> "모터1 정지";
            case MOTOR2_STOP -> "모터2 정지";
            case MOTOR_FAULT -> "모터불량";
        };
    }

    private String[] parseRecipients(String s) {
        if (s == null) return new String[0];
        return Arrays.stream(s.split("[,;]"))
                .map(String::trim)
                .filter(v -> !v.isEmpty())
                .toArray(String[]::new);
    }
}
