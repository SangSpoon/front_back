package com.smhrd.sangspoon.member.controller;

import com.smhrd.sangspoon.member.entity.MemberEntity;
import com.smhrd.sangspoon.member.service.MemberService;
import jakarta.servlet.http.HttpSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class LoginController {

    @Autowired
    private MemberService memberService;

    @GetMapping("/login")
    public String loginPage() {
        return "member/login";
    }

    @PostMapping("/login")
    public String login(@RequestParam String loginId,
                        @RequestParam String password,
                        HttpSession session,
                        Model model) {

        MemberEntity member = memberService.login(loginId, password);

        if (member != null) {
            session.setAttribute("loginMember", member);
            return "redirect:/";
        }
        else {
            model.addAttribute("errorMsg", "아이디 혹은 비밀번호가 잘못되었습니다.");
            return "member/login";
        }

    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.removeAttribute("loginMember");

        return "redirect:/";
    }

}
