package com.jprime.companion.service;

import com.jprime.companion.config.ImportProperties;
import com.jprime.companion.entity.Conference;
import com.jprime.companion.entity.Hall;
import com.jprime.companion.repository.ConferenceRepository;
import com.jprime.companion.repository.HallRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImportService {

    private final HallImportExecutor hallImportExecutor;
    private final ConferenceRepository conferenceRepository;
    private final HallRepository hallRepository;
    private final ImportProperties importProperties;

    @EventListener(ApplicationReadyEvent.class)
    public void importAll() {
        Conference conference = conferenceRepository.findByNameAndYear("jPrime", 2026)
                .orElseGet(() -> {
                    Conference c = new Conference();
                    c.setName("jPrime");
                    c.setYear(2026);
                    c.setLogoUrl("https://jprime.io/images/jprime-small.png");
                    return conferenceRepository.save(c);
                });

        for (String hallName : importProperties.getHalls()) {
            Hall hall = hallRepository.findByNameAndConference(hallName, conference)
                    .orElseGet(() -> {
                        Hall h = new Hall();
                        h.setName(hallName);
                        h.setConference(conference);
                        return hallRepository.save(h);
                    });
            try {
                hallImportExecutor.importHall(hallName, hall);
            } catch (Exception e) {
                log.warn("Import failed for hall {}: {}", hallName, e.getMessage());
            }
        }
        try {
            hallImportExecutor.importHall(null, null);
        } catch (Exception e) {
            log.warn("Import failed for shared sessions: {}", e.getMessage());
        }
    }
}
