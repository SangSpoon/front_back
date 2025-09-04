package com.smhrd.sangspoon.alert.service;

import com.smhrd.sangspoon.alert.AlertMetric;
import com.smhrd.sangspoon.alert.PerSiteFlags;
import com.smhrd.sangspoon.alert.dto.AlertConfigDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AlertConfigService {

    private volatile boolean uiEnabled = true;
    private volatile String recipients = "";

    private final Map<String, PerSiteFlags> matrix = new ConcurrentHashMap<>();

    @Value("${alert.email.recipients:}")
    private String defaultRecipients;

    public boolean isUiEnabled() { return uiEnabled; }

    public boolean isSiteEnabled(String siteId) {
        PerSiteFlags f = matrix.get(siteId);
        return f != null && f.isEnabled();
    }

    public boolean isMetricChecked(String siteId, AlertMetric metric) {
        PerSiteFlags f = matrix.get(siteId);
        if (f == null) return false;
        return switch (metric) {
            case HIGH_WATER -> f.isHighWater();
            case LOW_WATER -> f.isLowWater();
            case CHEMICAL -> f.isChemical();
            case MOTOR1_STOP -> f.isMotor1();
            case MOTOR2_STOP -> f.isMotor2();
            case MOTOR_FAULT -> f.isMotorFault();
        };
    }

    public String getRecipientsOrDefault() {
        String r = (recipients == null ? "" : recipients.trim());
        if (!r.isEmpty()) return r;
        return defaultRecipients == null ? "" : defaultRecipients.trim();
    }

    public AlertConfigDTO getSnapshot() {
        return new AlertConfigDTO(uiEnabled, recipients, Map.copyOf(matrix));
    }

    public void updateFrom(AlertConfigDTO dto) {
        if (dto == null) return;
        this.uiEnabled = dto.isUiEnabled();
        this.recipients = dto.getRecipients() == null ? "" : dto.getRecipients().trim();
        this.matrix.clear();
        if (dto.getMatrix() != null) {
            this.matrix.putAll(dto.getMatrix());
        }
    }
}
