package com.smhrd.sangspoon.alert;

public enum AlertMetric {
    HIGH_WATER,     // 고수위 (>80)
    LOW_WATER,      // 저수위 (<25)
    CHEMICAL,       // 약품 (<20)
    MOTOR1_STOP,    // 모터1 정지(0)
    MOTOR2_STOP,    // 모터2 정지(0)
    MOTOR_FAULT     // 모터 고장
}