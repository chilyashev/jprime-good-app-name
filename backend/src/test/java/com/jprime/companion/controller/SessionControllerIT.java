package com.jprime.companion.controller;

import com.jprime.companion.client.JprimeClient;
import com.jprime.companion.entity.Conference;
import com.jprime.companion.entity.Hall;
import com.jprime.companion.entity.Session;
import com.jprime.companion.repository.ConferenceRepository;
import com.jprime.companion.repository.HallRepository;
import com.jprime.companion.repository.SessionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
class SessionControllerIT {

    private MockMvc mockMvc;
    @Autowired
    private WebApplicationContext webApplicationContext;
    @Autowired private SessionRepository sessionRepository;
    @Autowired private HallRepository hallRepository;
    @Autowired private ConferenceRepository conferenceRepository;

    @MockitoBean private JprimeClient jprimeClient;

    private final LocalDateTime base = LocalDateTime.of(2026, 6, 4, 10, 0);

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
        when(jprimeClient.fetchByHall(any())).thenReturn(List.of());

        sessionRepository.deleteAll();
        hallRepository.deleteAll();
        conferenceRepository.deleteAll();

        Conference conf = new Conference();
        conf.setName("jPrime");
        conf.setYear(2026);
        conf = conferenceRepository.save(conf);

        Hall hallAEntity = new Hall();
        hallAEntity.setName("hall A");
        hallAEntity.setConference(conf);
        hallAEntity = hallRepository.save(hallAEntity);

        Hall hallBEntity = new Hall();
        hallBEntity.setName("hall B");
        hallBEntity.setConference(conf);
        hallRepository.save(hallBEntity);

        Hall workshopsEntity = new Hall();
        workshopsEntity.setName("workshops");
        workshopsEntity.setConference(conf);
        hallRepository.save(workshopsEntity);

        Session hallA = new Session();
        hallA.setId(1L);
        hallA.setHallName("hall A");
        hallA.setHall(hallAEntity);
        hallA.setTitle("Spring Boot talk");
        hallA.setStartTime(base);
        hallA.setEndTime(base.plusHours(1));

        Session shared = new Session();
        shared.setId(2L);
        shared.setHallName(null);
        shared.setHall(null);
        shared.setTitle("Registration");
        shared.setStartTime(base.minusHours(1));
        shared.setEndTime(base);

        sessionRepository.saveAll(List.of(hallA, shared));
    }

    @Test
    void getSessionsByHallAndDay_returnsHallAndShared() throws Exception {
        mockMvc.perform(get("/api/sessions").param("hall", "hall A").param("day", "2026-06-04"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getSessionsNoFilter_returnsAll() throws Exception {
        mockMvc.perform(get("/api/sessions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void getHalls_returnsSeededList() throws Exception {
        mockMvc.perform(get("/api/halls"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("hall A"))
                .andExpect(jsonPath("$[1]").value("hall B"))
                .andExpect(jsonPath("$[2]").value("workshops"));
    }
}
