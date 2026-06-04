package com.jprime.companion.repository;

import com.jprime.companion.entity.Conference;
import com.jprime.companion.entity.Speaker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SpeakerRepository extends JpaRepository<Speaker, Long> {

    Optional<Speaker> findByNameAndConference(String name, Conference conference);

    List<Speaker> findByConference(Conference conference);
}
