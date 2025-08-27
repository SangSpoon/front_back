package com.smhrd.sangspoon.site.entity;

import com.smhrd.sangspoon.member.entity.MemberEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "sites")
@Getter
@Setter
public class SiteEntity {

    @Id
    @Column(name = "management_code")
    private String managementCode;

    @Column(name = "site_name")
    private String siteName;

    @Column(name = "contact_number")
    private String contactNumber;

    @Column(name = "manager")
    private String manager; // 담당자 이름 -> DB 컬럼 'manager'

    @Column(name = "tank_type")
    private String tankType; // VARCHAR로 변경

    @Column(name = "length")
    private double length; // 가로

    @Column(name = "width")
    private double width; // 세로

    @Column(name = "height")
    private double height; // 높이

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private Status status;

    // 위치 관련 필드 추가 - 정확한 컬럼명 매핑
    private String location;
    
    private BigDecimal latitude;
    
    private BigDecimal longitude;

    @ManyToOne
    @JoinColumn(name = "member_id")
    private MemberEntity member;

    public enum Status {
        ACTIVE,        // 활성
        INACTIVE,      // 비활성
        MAINTENANCE    // 점검중
    }

    // 부피 계산 메서드
    public double calculateVolume() {
        if ("Circle".equals(tankType)) {
            // 원형 탱크: π * r² * h (r = width/2)
            double radius = width / 2;
            return Math.PI * radius * radius * height;
        } else if ("Square".equals(tankType)) {
            // 사각형 탱크: l * w * h
            return length * width * height;
        }
        return 0.0;
    }
}
