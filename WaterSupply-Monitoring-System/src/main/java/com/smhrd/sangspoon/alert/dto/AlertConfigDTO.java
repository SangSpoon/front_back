package com.smhrd.sangspoon.alert.dto;

import com.smhrd.sangspoon.alert.PerSiteFlags;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AlertConfigDTO {
    private boolean uiEnabled;
    private String recipients;
    private Map<String, PerSiteFlags> matrix;
}
