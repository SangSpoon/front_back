package com.smhrd.sangspoon.member.controller;

import com.smhrd.sangspoon.member.entity.MemberEntity;
import com.smhrd.sangspoon.member.service.MemberService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/member")
public class MemberApiController {

    @Autowired
    private MemberService memberService;

    // 회원가입 API
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody Map<String, String> requestData) {
        Map<String, Object> response = new HashMap<>();
        
        System.out.println("회원가입 요청 받음: " + requestData.toString());
        
        try {
            // Map에서 MemberEntity로 변환
            MemberEntity member = new MemberEntity();
            member.setName(requestData.get("name"));
            member.setLoginId(requestData.get("loginId"));
            member.setEmail(requestData.get("email"));
            member.setPhoneNumber(requestData.get("phoneNumber"));
            member.setPassword(requestData.get("password"));
            
            System.out.println("변환된 Member: " + member.toString());
            
            memberService.registerMember(member);
            response.put("success", true);
            response.put("message", "회원가입이 완료되었습니다.");
            System.out.println("회원가입 성공");
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            System.out.println("회원가입 실패: " + e.getMessage());
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        } catch (Exception e) {
            System.out.println("회원가입 예외: " + e.getMessage());
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "서버 오류가 발생했습니다.");
            return ResponseEntity.status(500).body(response);
        }
    }

    // 로그인 API
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginRequest,
                                                     HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        String loginId = loginRequest.get("loginId");
        String password = loginRequest.get("password");
        
        MemberEntity member = memberService.login(loginId, password);
        
        if (member != null) {
            session.setAttribute("loginMember", member);
            response.put("success", true);
            response.put("message", "로그인 성공");
            response.put("member", member);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "아이디 혹은 비밀번호가 잘못되었습니다.");
            return ResponseEntity.badRequest().body(response);
        }
    }

    // 로그아웃 API
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        session.removeAttribute("loginMember");
        response.put("success", true);
        response.put("message", "로그아웃 되었습니다.");
        
        return ResponseEntity.ok(response);
    }

    // 현재 로그인 사용자 정보 조회 API
    @GetMapping("/current")
    public ResponseEntity<Map<String, Object>> getCurrentUser(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        
        MemberEntity loginMember = (MemberEntity) session.getAttribute("loginMember");
        
        if (loginMember != null) {
            response.put("success", true);
            response.put("member", loginMember);
            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "로그인이 필요합니다.");
            return ResponseEntity.status(401).body(response);
        }
    }
}