package com.jprime.companion.controller;

import com.jprime.companion.entity.Session;
import com.jprime.companion.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @GetMapping
    public List<Session> sessions(
            @RequestParam(required = false) String hall,
            @RequestParam(required = false) String day) {
        return sessionService.findByHallAndDay(hall, day);
    }
}
