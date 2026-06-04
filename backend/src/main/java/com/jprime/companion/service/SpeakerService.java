package com.jprime.companion.service;

import com.jprime.companion.entity.Conference;
import com.jprime.companion.entity.Speaker;
import com.jprime.companion.repository.SpeakerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SpeakerService {

    private final SpeakerRepository speakerRepository;

    public Speaker findOrCreate(String name, Conference conference) {
        return speakerRepository.findByNameAndConference(name, conference)
                .orElseGet(() -> {
                    Speaker speaker = new Speaker();
                    speaker.setName(name);
                    speaker.setConference(conference);
                    return speakerRepository.save(speaker);
                });
    }
}
