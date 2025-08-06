package com.smhrd.sangspoon.site.entity;

import com.smhrd.sangspoon.member.entity.MemberEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "sites")
@Getter
@Setter
public class SiteEntity {

    @Id
    private String managementCode;

    private String siteName;
    private String contactNumber;
    private TankType tankType;
    private double length; // 가로
    private double width; // 세로
    private double height; // 높이
    private Status status;

    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private MemberEntity member;

    public enum TankType {
        Circle, Square // 원형, 사각
    }

    public enum Status {
        ACTIVE, INACTIVE // 활성, 비활성
    }
}
