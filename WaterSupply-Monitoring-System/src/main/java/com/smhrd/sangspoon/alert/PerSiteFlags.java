package com.smhrd.sangspoon.alert;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PerSiteFlags {

    private boolean enabled;
    private boolean highWater;
    private boolean lowWater;
    private boolean chemical;
    private boolean motor1;
    private boolean motor2;
    private boolean motorFault;

}
