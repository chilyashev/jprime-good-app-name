package com.jprime.companion.repository;

import com.jprime.companion.entity.Conference;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ConferenceRepository extends JpaRepository<Conference, Long> {
    Optional<Conference> findByNameAndYear(String name, int year);
}
