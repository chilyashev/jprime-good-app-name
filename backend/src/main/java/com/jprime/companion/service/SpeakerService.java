package com.jprime.companion.service;

import com.jprime.companion.client.JprimeClient;
import com.jprime.companion.entity.Conference;
import com.jprime.companion.entity.Speaker;
import com.jprime.companion.repository.SpeakerRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpeakerService {

    private final SpeakerRepository speakerRepository;
    private final JprimeClient jprimeClient;

    public Speaker findOrCreate(String name, Conference conference) {
        return speakerRepository.findByNameAndConference(name, conference)
                .orElseGet(() -> {
                    Speaker speaker = new Speaker();
                    speaker.setName(name);
                    speaker.setConference(conference);
                    return speakerRepository.save(speaker);
                });
    }

    public void enrichSpeakers(Conference conference) {
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
