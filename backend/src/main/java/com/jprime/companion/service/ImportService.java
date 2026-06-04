package com.jprime.companion.service;

import com.jprime.companion.client.JprimeClient;
import com.jprime.companion.config.ImportProperties;
import com.jprime.companion.entity.Conference;
import com.jprime.companion.entity.Hall;
import com.jprime.companion.repository.ConferenceRepository;
import com.jprime.companion.repository.HallRepository;
import com.jprime.companion.repository.SpeakerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class ImportService {

    private final HallImportExecutor hallImportExecutor;
    private final ConferenceRepository conferenceRepository;
    private final HallRepository hallRepository;
    private final ImportProperties importProperties;
    private final JprimeClient jprimeClient;
    private final SpeakerRepository speakerRepository;

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
                hallImportExecutor.importHall(hallName, hall, conference);
            } catch (Exception e) {
                log.warn("Import failed for hall {}: {}", hallName, e.getMessage());
            }
        }
        try {
            hallImportExecutor.importHall(null, null, conference);
        } catch (Exception e) {
            log.warn("Import failed for shared sessions: {}", e.getMessage());
        }

        enrichSpeakers(conference);
    }

    private void enrichSpeakers(Conference conference) {
        Map<String, Long> idsByName;
        try {
            idsByName = jprimeClient.fetchSpeakerIdsByName();
        } catch (Exception e) {
            log.warn("Could not fetch speaker IDs from jprime.io: {}", e.getMessage());
            return;
        }

        speakerRepository.findByConference(conference).forEach(speaker -> {
            if (speaker.getImageUrl() != null) return;
            Long jprimeId = idsByName.get(speaker.getName());
            if (jprimeId == null) {
                log.debug("No jprime ID found for speaker '{}'", speaker.getName());
                return;
            }
            speaker.setJprimeSpeakerId(jprimeId);
            speaker.setImageUrl("https://jprime.io/image/speaker/" + jprimeId);
            try {
                speaker.setBio(jprimeClient.fetchSpeakerBio(jprimeId));
            } catch (Exception e) {
                log.warn("Could not fetch bio for speaker '{}': {}", speaker.getName(), e.getMessage());
            }
            speakerRepository.save(speaker);
            log.info("Enriched speaker '{}' with jprime ID {}", speaker.getName(), jprimeId);
        });
    }
}
