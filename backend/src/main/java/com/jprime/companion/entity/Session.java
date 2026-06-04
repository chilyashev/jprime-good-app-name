package com.jprime.companion.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "sessions")
@Data
public class Session {
    @Id
    private Long id;

    @Column(nullable = true)
    private String hallName;

    @ManyToOne
    @JoinColumn(name = "hall_id")
    private Hall hall;

    @Column(nullable = true)
    private String title;

    @Column(nullable = true)
    private String lectorName;

    @Column(nullable = true)
    private String coLectorName;

    @Column(nullable = true, columnDefinition = "TEXT")
    private String talkDescription;

    private LocalDateTime startTime;

    private LocalDateTime endTime;
}
