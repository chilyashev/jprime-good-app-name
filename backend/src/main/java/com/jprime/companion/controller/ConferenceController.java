package com.jprime.companion.controller;

import com.jprime.companion.entity.Conference;
import com.jprime.companion.repository.ConferenceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/conference")
@RequiredArgsConstructor
public class ConferenceController {

    private final ConferenceRepository conferenceRepository;

    @GetMapping("/current")
    public ResponseEntity<Conference> current() {
        return conferenceRepository.findByNameAndYear("jPrime", 2026)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
