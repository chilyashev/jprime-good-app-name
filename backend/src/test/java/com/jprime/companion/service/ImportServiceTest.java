package com.jprime.companion.service;

import com.jprime.companion.config.ImportProperties;
import com.jprime.companion.entity.Conference;
import com.jprime.companion.entity.Hall;
import com.jprime.companion.repository.ConferenceRepository;
import com.jprime.companion.repository.HallRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ImportServiceTest {

    @Mock private HallImportExecutor hallImportExecutor;
    @Mock private ConferenceRepository conferenceRepository;
    @Mock private HallRepository hallRepository;
    @Mock private ImportProperties importProperties;

    @InjectMocks
    private ImportService importService;

    private Conference conference;
    private Hall hallA, hallB, workshops;

    @BeforeEach
    void setUp() {
        conference = new Conference();
        conference.setId(1L);
        conference.setName("jPrime");
        conference.setYear(2026);

        hallA = hall(1L, "hall A");
        hallB = hall(2L, "hall B");
        workshops = hall(3L, "workshops");

        when(importProperties.getHalls()).thenReturn(List.of("hall A", "hall B", "workshops"));
        when(conferenceRepository.findByNameAndYear("jPrime", 2026)).thenReturn(Optional.of(conference));
        when(hallRepository.findByNameAndConference("hall A", conference)).thenReturn(Optional.of(hallA));
        when(hallRepository.findByNameAndConference("hall B", conference)).thenReturn(Optional.of(hallB));
        when(hallRepository.findByNameAndConference("workshops", conference)).thenReturn(Optional.of(workshops));
    }

    private Hall hall(long id, String name) {
        Hall h = new Hall();
        h.setId(id);
        h.setName(name);
        h.setConference(conference);
        return h;
    }

    @Test
    void givenAllHallsSucceed_whenImportAll_thenImportsAllHalls() {
        importService.importAll();

        verify(hallImportExecutor).importHall("hall A", hallA, conference);
        verify(hallImportExecutor).importHall("hall B", hallB, conference);
        verify(hallImportExecutor).importHall("workshops", workshops, conference);
        verify(hallImportExecutor).importHall(null, null, conference);
    }

    @Test
    void givenHallBThrows_afterRetries_otherHallsStillImport() {
        doThrow(new RuntimeException("timeout")).when(hallImportExecutor).importHall(eq("hall B"), any(), any());

        importService.importAll();

        verify(hallImportExecutor).importHall("hall A", hallA, conference);
        verify(hallImportExecutor).importHall("workshops", workshops, conference);
        verify(hallImportExecutor).importHall(null, null, conference);
    }

    @Test
    void givenSharedCallThrows_whenImportAll_thenHallsStillImport() {
        doThrow(new RuntimeException("network error")).when(hallImportExecutor).importHall(isNull(), isNull(), any());

        importService.importAll();

        verify(hallImportExecutor).importHall("hall A", hallA, conference);
        verify(hallImportExecutor).importHall("hall B", hallB, conference);
        verify(hallImportExecutor).importHall("workshops", workshops, conference);
    }
}
