package com.jprime.companion.service;

import com.jprime.companion.client.JprimeClient;
import com.jprime.companion.entity.Hall;
import com.jprime.companion.entity.Session;
import com.jprime.companion.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Recover;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class HallImportExecutor {

    private final JprimeClient jprimeClient;
    private final SessionRepository sessionRepository;

    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void importHall(String hallName, Hall hall) {
        List<Session> sessions = jprimeClient.fetchByHall(hallName);
        sessions.forEach(s -> s.setHall(hall));
        sessionRepository.saveAll(sessions);
        log.info("Imported {} sessions for hall '{}'", sessions.size(), hallName != null ? hallName : "shared");
    }

    @Recover
    public void recover(Exception e, String hallName, Hall hall) {
        log.warn("All retries exhausted for hall '{}': {}", hallName != null ? hallName : "shared", e.getMessage());
    }
}
