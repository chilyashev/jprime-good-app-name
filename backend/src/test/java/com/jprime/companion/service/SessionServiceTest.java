package com.jprime.companion.service;

import com.jprime.companion.entity.Session;
import com.jprime.companion.repository.SessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SessionServiceTest {

    @Mock
    private SessionRepository sessionRepository;

    @InjectMocks
    private SessionService sessionService;

    private final LocalDateTime t = LocalDateTime.of(2026, 6, 4, 10, 0);
    private Session session;

    @BeforeEach
    void setUp() {
        session = new Session();
        session.setId(1L);
        session.setHallName("hall A");
        session.setStartTime(t);
        session.setEndTime(t.plusHours(1));
    }

    @Test
    void givenNullHallAndDay_thenReturnsAll() {
        when(sessionRepository.findAllByOrderByStartTimeAsc()).thenReturn(List.of(session));

        List<Session> result = sessionService.findByHallAndDay(null, null);

        assertThat(result).containsExactly(session);
        verify(sessionRepository).findAllByOrderByStartTimeAsc();
    }

    @Test
    void givenHallOnly_thenQueriesByHall() {
        when(sessionRepository.findByHallName("hall A")).thenReturn(List.of(session));

        List<Session> result = sessionService.findByHallAndDay("hall A", null);

        assertThat(result).containsExactly(session);
        verify(sessionRepository).findByHallName("hall A");
    }

    @Test
    void givenDayOnly_thenQueriesByDay() {
        LocalDateTime start = LocalDate.of(2026, 6, 4).atStartOfDay();
        when(sessionRepository.findByDay(start, start.plusDays(1))).thenReturn(List.of(session));

        List<Session> result = sessionService.findByHallAndDay(null, "2026-06-04");

        assertThat(result).containsExactly(session);
        verify(sessionRepository).findByDay(start, start.plusDays(1));
    }

    @Test
    void givenHallAndDay_thenQueriesByHallAndDay() {
        LocalDateTime start = LocalDate.of(2026, 6, 4).atStartOfDay();
        when(sessionRepository.findByHallNameAndDay(eq("hall A"), eq(start), eq(start.plusDays(1))))
                .thenReturn(List.of(session));

        List<Session> result = sessionService.findByHallAndDay("hall A", "2026-06-04");

        assertThat(result).containsExactly(session);
        verify(sessionRepository).findByHallNameAndDay("hall A", start, start.plusDays(1));
    }
}
