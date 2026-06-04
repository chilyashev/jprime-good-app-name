package com.jprime.companion.repository;

import com.jprime.companion.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SessionRepository extends JpaRepository<Session, Long> {

    @Query("SELECT DISTINCT s.hallName FROM Session s WHERE s.hallName IS NOT NULL")
    List<String> findDistinctHallNames();

    List<Session> findAllByOrderByStartTimeAsc();

    @Query("SELECT s FROM Session s WHERE (s.hallName = :hallName OR s.hallName IS NULL) ORDER BY s.startTime")
    List<Session> findByHall(@Param("hallName") String hallName);

    @Query("SELECT s FROM Session s WHERE s.startTime >= :dayStart AND s.startTime < :dayEnd ORDER BY s.startTime")
    List<Session> findByDay(@Param("dayStart") LocalDateTime dayStart, @Param("dayEnd") LocalDateTime dayEnd);

    @Query("SELECT s FROM Session s WHERE (s.hallName = :hallName OR s.hallName IS NULL) AND s.startTime >= :dayStart AND s.startTime < :dayEnd ORDER BY s.startTime")
    List<Session> findByHallAndDay(@Param("hallName") String hallName, @Param("dayStart") LocalDateTime dayStart, @Param("dayEnd") LocalDateTime dayEnd);

    @Query("SELECT s FROM Session s LEFT JOIN s.hall h WHERE (h.name = :hallName OR s.hall IS NULL) ORDER BY s.startTime")
    List<Session> findByHallName(@Param("hallName") String hallName);

    @Query("SELECT s FROM Session s LEFT JOIN s.hall h WHERE (h.name = :hallName OR s.hall IS NULL) AND s.startTime >= :dayStart AND s.startTime < :dayEnd ORDER BY s.startTime")
    List<Session> findByHallNameAndDay(@Param("hallName") String hallName, @Param("dayStart") LocalDateTime dayStart, @Param("dayEnd") LocalDateTime dayEnd);
}
