package com.jprime.companion.controller;

import com.jprime.companion.config.ConferenceProperties;
import com.jprime.companion.config.ImportProperties;
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
    private final ImportProperties importProperties;
    private final ConferenceProperties conferenceProperties;

    record ConferenceResponse(Long id, String name, Integer year, String logoUrl,
                              String venueName, String venueAddress, String venueMapUrl) {

    }

    @GetMapping("/current")
    public ResponseEntity<ConferenceResponse> current() {
        return conferenceRepository.findByNameAndYear(importProperties.getConferenceName(), importProperties.getConferenceYear())
                .map(c -> ResponseEntity.ok(toResponse(c)))
                .orElse(ResponseEntity.notFound().build());
    }

    private ConferenceResponse toResponse(Conference c) {
        return new ConferenceResponse(
                c.getId(), c.getName(), c.getYear(), c.getLogoUrl(),
                conferenceProperties.getVenueName(),
                conferenceProperties.getVenueAddress(),
                conferenceProperties.getVenueMapUrl()
        );
    }
}
