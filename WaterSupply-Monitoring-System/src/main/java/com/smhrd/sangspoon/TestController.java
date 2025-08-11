package com.smhrd.sangspoon;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class TestController {

    // 확인해보고 싶은 front html 컨트롤러 만들어서 확인
    // 추후 해당 파일은 삭제 예정

    @GetMapping("/test/index")
    public String index() {
        return "index";
    }

    @GetMapping("/test/register")
    public String register() {
        return "auth-register";
    }
}
