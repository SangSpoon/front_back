package com.smhrd.sangspoon.member.controller;

import com.smhrd.sangspoon.member.entity.MemberEntity;
import com.smhrd.sangspoon.member.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class MemberController {

    @Autowired
    private MemberService memberService;

    @GetMapping("/register")
    public String registerForm(){
        return "member/register";
    }

    @PostMapping("/register")
    public String register(MemberEntity member, Model model) {
        try {
            memberService.registerMember(member);
            return "redirect:/login";
        } catch (IllegalArgumentException e) {
            model.addAttribute("errorMessage", e.getMessage());
            return "redirect:/register";
        }
    }
}
