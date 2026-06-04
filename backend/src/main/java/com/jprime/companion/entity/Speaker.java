package com.jprime.companion.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "speakers")
@Data
public class Speaker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "jprime_speaker_id")
    private Long jprimeSpeakerId;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @ManyToOne(optional = false)
    @JoinColumn(name = "conference_id")
    @JsonIgnore
    private Conference conference;
}
