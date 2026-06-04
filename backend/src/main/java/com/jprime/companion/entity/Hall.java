package com.jprime.companion.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "halls")
@Data
public class Hall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(optional = false)
    @JoinColumn(name = "conference_id")
    private Conference conference;
}
