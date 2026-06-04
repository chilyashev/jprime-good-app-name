package com.jprime.companion.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "conferences")
@Data
public class Conference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "conference_year", nullable = false)
    private Integer year;
}
