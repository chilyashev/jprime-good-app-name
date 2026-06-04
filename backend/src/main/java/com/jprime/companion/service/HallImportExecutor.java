package com.jprime.companion.service;

import com.jprime.companion.client.JprimeClient;
import com.jprime.companion.entity.Conference;
import com.jprime.companion.entity.Hall;
import com.jprime.companion.entity.Session;
import com.jprime.companion.entity.Speaker;
import com.jprime.companion.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class HallImportExecutor {

    private final JprimeClient jprimeClient;
    private final SessionRepository sessionRepository;
    private final SpeakerService speakerService;

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void importHall(String hallName, Hall hall, Conference conference) {
        List<Session> sessions = jprimeClient.fetchByHall(hallName);
        sessions.forEach(s -> {
            s.setHall(hall);
            List<Speaker> speakers = new ArrayList<>();
            if (s.getLectorName() != null) {
                speakers.add(speakerService.findOrCreate(s.getLectorName(), conference));
            }
            if (s.getCoLectorName() != null) {
                speakers.add(speakerService.findOrCreate(s.getCoLectorName(), conference));
            }
            s.setSpeakers(speakers);
        });
        sessionRepository.saveAll(sessions);
        log.info("Imported {} sessions for hall '{}'", sessions.size(), hallName != null ? hallName : "shared");
    }

    @Recover
    public void recover(Exception e, String hallName, Hall hall, Conference conference) {
        log.warn("All retries exhausted for hall '{}': {}", hallName != null ? hallName : "shared", e.getMessage());
    }
}
