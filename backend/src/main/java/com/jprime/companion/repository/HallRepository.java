package com.jprime.companion.repository;

import com.jprime.companion.entity.Conference;
import com.jprime.companion.entity.Hall;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface HallRepository extends JpaRepository<Hall, Long> {
    Optional<Hall> findByNameAndConference(String name, Conference conference);
    List<Hall> findAllByOrderByNameAsc();
}
