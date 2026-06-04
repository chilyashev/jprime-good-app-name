package com.jprime.companion.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "session_speakers",
            joinColumns = @JoinColumn(name = "session_id"),
            inverseJoinColumns = @JoinColumn(name = "speaker_id")
    )
    @EqualsAndHashCode.Exclude
    private List<Speaker> speakers = new ArrayList<>();
}
