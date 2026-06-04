package com.jprime.companion.controller;

import com.jprime.companion.entity.Session;
import com.jprime.companion.entity.Speaker;
import com.jprime.companion.repository.SessionRepository;
import com.jprime.companion.repository.SpeakerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/speakers")
@RequiredArgsConstructor
public class SpeakerController {

    private final SpeakerRepository speakerRepository;
    private final SessionRepository sessionRepository;

    @GetMapping
    public List<Speaker> speakers() {
        return speakerRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpeakerDetail> speaker(@PathVariable Long id) {
        return speakerRepository.findById(id)
                .map(sp -> {
                    List<Session> sessions = sessionRepository.findBySpeakersContaining(sp);
                    return ResponseEntity.ok(new SpeakerDetail(sp.getId(), sp.getName(), sp.getImageUrl(), sp.getBio(), sessions));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    record SpeakerDetail(Long id, String name, String imageUrl, String bio, List<Session> sessions) {

    }
}
