package com.smhrd.sangspoon.site.controller;

import com.smhrd.sangspoon.member.entity.MemberEntity;
import com.smhrd.sangspoon.member.repository.MemberRepository;
import com.smhrd.sangspoon.site.entity.SiteEntity;
import com.smhrd.sangspoon.site.repository.SiteRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.*;

@RestController
@RequestMapping("/api/sites")
public class SiteController {

    private final SiteRepository siteRepository;
    private final MemberRepository memberRepository;
    private static final Logger log = LoggerFactory.getLogger(SiteController.class);

    public SiteController(SiteRepository siteRepository, MemberRepository memberRepository) {
        this.siteRepository = siteRepository;
        this.memberRepository = memberRepository;
    }

    // DTOs
    public record CreateOrUpdateSiteRequest(
            String managementCode,
            String siteName,
            String contactNumber,
            String manager,
            String tankType,
            Double length,
            Double width,
            Double height,
            String status,
            Long memberId,
            // 위치 필드 추가
            String location,
            BigDecimal latitude,
            BigDecimal longitude
    ) {}

    public record ApiResponse<T>(boolean success, String message, T data) {}

    public record SiteResponse(
            String managementCode,
            String siteName,
            String contactNumber,
            String manager,
            String tankType,
            double length,
            double width,
            double height,
            String status,
            Double calculatedVolume,
            Long memberId,
            String memberName,
            String memberLoginId,
            // 위치 필드 추가
            String location,
            BigDecimal latitude,
            BigDecimal longitude
    ) {}

    private static String normalizeTankType(String raw) {
        if (raw == null) return null;
        String v = raw.trim().toLowerCase(Locale.ROOT);
        // 허용되는 다양한 표기 매핑
        if (v.equals("circular") || v.equals("circle") || v.equals("원형") || v.equals("원")) {
            return "Circle";
        }
        if (v.equals("square") || v.equals("rect") || v.equals("rectangle") || v.equals("사각형") || v.equals("사각")) {
            return "Square";
        }
        return raw; // 그대로 저장 (유효성은 엔드포인트에서 추가 검증 가능)
    }

    private static SiteEntity.Status parseStatus(String raw) {
        if (raw == null) return SiteEntity.Status.ACTIVE;
        String v = raw.trim().toUpperCase(Locale.ROOT);
        // 한글 매핑
        if (v.contains("활성")) return SiteEntity.Status.ACTIVE;
        if (v.contains("비활성")) return SiteEntity.Status.INACTIVE;
        if (v.contains("점검")) return SiteEntity.Status.MAINTENANCE;

        // 영문 매핑
        try {
            return SiteEntity.Status.valueOf(v);
        } catch (IllegalArgumentException ex) {
            return SiteEntity.Status.ACTIVE;
        }
    }

    private static SiteResponse toResponse(SiteEntity e) {
        Double volume = e.calculateVolume();
        Long memberId = e.getMember() != null ? e.getMember().getId() : null;
        String memberName = e.getMember() != null ? e.getMember().getName() : null;
        String memberLoginId = e.getMember() != null ? e.getMember().getLoginId() : null;
        return new SiteResponse(
                e.getManagementCode(),
                e.getSiteName(),
                e.getContactNumber(),
                e.getManager(),
                e.getTankType(),
                e.getLength(),
                e.getWidth(),
                e.getHeight(),
                e.getStatus() != null ? e.getStatus().name() : null,
                volume,
                memberId,
                memberName,
                memberLoginId,
                // 위치 필드 매핑 추가
                e.getLocation(),
                e.getLatitude(),
                e.getLongitude()
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SiteResponse>> create(@RequestBody CreateOrUpdateSiteRequest req, jakarta.servlet.http.HttpSession session) {
        if (req.managementCode == null || req.managementCode().isBlank()) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "managementCode는 필수입니다.", null));
        }
        if (siteRepository.existsById(req.managementCode())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ApiResponse<>(false, "이미 존재하는 관리번호입니다.", null));
        }

        SiteEntity entity = new SiteEntity();
        entity.setManagementCode(req.managementCode());
        entity.setSiteName(req.siteName());
        entity.setContactNumber(req.contactNumber());
        entity.setManager(Optional.ofNullable(req.manager()).filter(v -> !v.isBlank()).orElse(null));
        entity.setTankType(normalizeTankType(req.tankType()));
        entity.setLength(Optional.ofNullable(req.length()).orElse(0.0));
        entity.setWidth(Optional.ofNullable(req.width()).orElse(0.0));
        entity.setHeight(Optional.ofNullable(req.height()).orElse(0.0));
        entity.setStatus(parseStatus(req.status()));

        // 위치 필드 설정 추가 - 유효성 검사 포함
        entity.setLocation(Optional.ofNullable(req.location()).filter(v -> !v.isBlank()).orElse(null));
        
        // 위도/경도 유효성 검사 및 설정
        if (req.latitude() != null && req.longitude() != null) {
            // 위도: -90 ~ 90, 경도: -180 ~ 180 범위 검사
            if (req.latitude().doubleValue() >= -90 && req.latitude().doubleValue() <= 90 &&
                req.longitude().doubleValue() >= -180 && req.longitude().doubleValue() <= 180) {
                entity.setLatitude(req.latitude());
                entity.setLongitude(req.longitude());
                log.info("위치 좌표 설정: 위도={}, 경도={}", req.latitude(), req.longitude());
            } else {
                log.warn("잘못된 좌표값: 위도={}, 경도={}", req.latitude(), req.longitude());
                entity.setLatitude(null);
                entity.setLongitude(null);
            }
        } else {
            entity.setLatitude(null);
            entity.setLongitude(null);
        }

        // 세션의 로그인 회원만 사용 (요청의 memberId는 무시)
        Object loginMemberObj = session.getAttribute("loginMember");
        if (!(loginMemberObj instanceof MemberEntity loginMember)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(false, "로그인이 필요합니다.", null));
        }
        // ID만 참조해서 프록시로 연결해도 되고, 실제 엔티티를 로드해도 됨
        log.info("Creating site by memberId={}, managementCode={}", loginMember.getId(), req.managementCode());
        MemberEntity attachedMember = memberRepository.findById(loginMember.getId()).orElse(loginMember);
        entity.setMember(attachedMember);

        // manager가 비어있다면 로그인 사용자 이름으로 보완
        if (entity.getManager() == null || entity.getManager().isBlank()) {
            entity.setManager(attachedMember.getName());
        }

        SiteEntity saved = siteRepository.save(entity);
        log.info("Saved site managementCode={} with memberId={}, location={}, coordinates=({}, {})", 
                saved.getManagementCode(), 
                saved.getMember() != null ? saved.getMember().getId() : null,
                saved.getLocation(),
                saved.getLatitude(),
                saved.getLongitude());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "사이트가 생성되었습니다.", toResponse(saved)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SiteResponse>>> findAll() {
        List<SiteResponse> list = siteRepository.findAll().stream().map(SiteController::toResponse).toList();
        return ResponseEntity.ok(new ApiResponse<>(true, "사이트 목록", list));
    }

    @GetMapping("/{managementCode}")
    public ResponseEntity<ApiResponse<SiteResponse>> findOne(@PathVariable String managementCode) {
        return siteRepository.findById(managementCode)
                .map(e -> ResponseEntity.ok(new ApiResponse<>(true, "사이트 조회", toResponse(e))))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ApiResponse<>(false, "사이트가 존재하지 않습니다.", null)));
    }

    @PutMapping("/{managementCode}")
    public ResponseEntity<ApiResponse<SiteResponse>> update(@PathVariable String managementCode,
                                                            @RequestBody CreateOrUpdateSiteRequest req) {
        Optional<SiteEntity> opt = siteRepository.findById(managementCode);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "사이트가 존재하지 않습니다.", null));
        }
        SiteEntity entity = opt.get();
        if (req.siteName() != null) entity.setSiteName(req.siteName());
        if (req.contactNumber() != null) entity.setContactNumber(req.contactNumber());
        if (req.tankType() != null) entity.setTankType(normalizeTankType(req.tankType()));
        if (req.manager() != null) entity.setManager(req.manager());
        if (req.length() != null) entity.setLength(req.length());
        if (req.width() != null) entity.setWidth(req.width());
        if (req.height() != null) entity.setHeight(req.height());
        if (req.status() != null) entity.setStatus(parseStatus(req.status()));
        if (req.memberId() != null) {
            memberRepository.findById(req.memberId()).ifPresent(entity::setMember);
        }

        // 위치 필드 업데이트 - 유효성 검사 포함
        if (req.location() != null) {
            entity.setLocation(req.location().isBlank() ? null : req.location());
        }
        
        // 위도/경도 업데이트 - 유효성 검사 포함
        if (req.latitude() != null && req.longitude() != null) {
            // 위도: -90 ~ 90, 경도: -180 ~ 180 범위 검사
            if (req.latitude().doubleValue() >= -90 && req.latitude().doubleValue() <= 90 &&
                req.longitude().doubleValue() >= -180 && req.longitude().doubleValue() <= 180) {
                entity.setLatitude(req.latitude());
                entity.setLongitude(req.longitude());
                log.info("위치 좌표 업데이트: 위도={}, 경도={}", req.latitude(), req.longitude());
            } else {
                log.warn("잘못된 좌표값으로 업데이트 실패: 위도={}, 경도={}", req.latitude(), req.longitude());
                // 기존 값 유지
            }
        } else if (req.latitude() == null && req.longitude() == null) {
            // 둘 다 null이면 좌표 정보 제거
            entity.setLatitude(null);
            entity.setLongitude(null);
            log.info("위치 좌표 정보 제거");
        }

        SiteEntity saved = siteRepository.save(entity);
        log.info("Updated site managementCode={} with location={}, coordinates=({}, {})", 
                saved.getManagementCode(),
                saved.getLocation(),
                saved.getLatitude(),
                saved.getLongitude());
        return ResponseEntity.ok(new ApiResponse<>(true, "사이트가 수정되었습니다.", toResponse(saved)));
    }

    @DeleteMapping("/{managementCode}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable String managementCode) {
        if (!siteRepository.existsById(managementCode)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ApiResponse<>(false, "사이트가 존재하지 않습니다.", null));
        }
        siteRepository.deleteById(managementCode);
        return ResponseEntity.ok(new ApiResponse<>(true, "사이트가 삭제되었습니다.", null));
    }

    // DB 연결 및 테이블 구조 테스트용 엔드포인트
    @GetMapping("/test/db-connection")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testDbConnection() {
        try {
            Map<String, Object> result = new HashMap<>();
            
            // 전체 사이트 수 조회
            long totalSites = siteRepository.count();
            result.put("totalSites", totalSites);
            
            // 최근 사이트 5개 조회 (위치 정보 포함)
            List<SiteResponse> recentSites = siteRepository.findAll().stream()
                    .limit(5)
                    .map(SiteController::toResponse)
                    .toList();
            result.put("recentSites", recentSites);
            
            // 위치 정보가 있는 사이트 수
            long sitesWithLocation = siteRepository.findAll().stream()
                    .filter(site -> site.getLocation() != null && !site.getLocation().isBlank())
                    .count();
            result.put("sitesWithLocation", sitesWithLocation);
            
            // 좌표 정보가 있는 사이트 수
            long sitesWithCoordinates = siteRepository.findAll().stream()
                    .filter(site -> site.getLatitude() != null && site.getLongitude() != null)
                    .count();
            result.put("sitesWithCoordinates", sitesWithCoordinates);
            
            log.info("DB 연결 테스트 성공: 총 사이트={}, 위치정보={}, 좌표정보={}", 
                    totalSites, sitesWithLocation, sitesWithCoordinates);
            
            return ResponseEntity.ok(new ApiResponse<>(true, "DB 연결 테스트 성공", result));
        } catch (Exception e) {
            log.error("DB 연결 테스트 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(false, "DB 연결 테스트 실패: " + e.getMessage(), null));
        }
    }
}


