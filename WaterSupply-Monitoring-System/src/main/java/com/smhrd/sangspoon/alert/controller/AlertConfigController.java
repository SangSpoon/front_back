package com.smhrd.sangspoon.alert.controller;

import com.smhrd.sangspoon.alert.dto.AlertConfigDTO;
import com.smhrd.sangspoon.alert.service.AlertConfigService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts/config")
public class AlertConfigController {

    private final AlertConfigService alertConfigService;

    public AlertConfigController(AlertConfigService alertConfigService) {
        this.alertConfigService = alertConfigService;
    }

    @GetMapping
    public ResponseEntity<AlertConfigDTO> get() {
        return ResponseEntity.ok(alertConfigService.getSnapshot());
    }

    @PostMapping
    public ResponseEntity<Void> save(@RequestBody AlertConfigDTO dto) {
        alertConfigService.updateFrom(dto);
        return ResponseEntity.ok().build();
    }
}
