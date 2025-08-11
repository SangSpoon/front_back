package com.smhrd.sangspoon.sensor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Table(name = "parsed_data")
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Getter
@Setter
public class ParsedDataEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double waterLevel;
    private double chemicalLevel;
    private int motorStatus1;
    private int motorStatus2;
    private double flowRate;
    private double totalAmount;

    @OneToOne
    @JoinColumn(name = "sensor_data_id", unique = true, nullable = false)
    private SensorDataEntity sensor;
}
