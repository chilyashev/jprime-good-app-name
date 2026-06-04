package com.jprime.companion.service;

import com.jprime.companion.entity.Session;
import com.jprime.companion.repository.SessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;

    public List<Session> findByHallAndDay(String hall, String day) {
        if (hall == null && day == null) {
            return sessionRepository.findAllByOrderByStartTimeAsc();
        }
        if (hall != null && day != null) {
            LocalDateTime dayStart = LocalDate.parse(day).atStartOfDay();
            return sessionRepository.findByHallNameAndDay(hall, dayStart, dayStart.plusDays(1));
        }
        if (hall != null) {
            return sessionRepository.findByHallName(hall);
        }
        LocalDateTime dayStart = LocalDate.parse(day).atStartOfDay();
        return sessionRepository.findByDay(dayStart, dayStart.plusDays(1));
    }
}
