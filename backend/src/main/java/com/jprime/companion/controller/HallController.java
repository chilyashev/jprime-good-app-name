package com.jprime.companion.controller;

import com.jprime.companion.repository.HallRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/halls")
@RequiredArgsConstructor
public class HallController {

    private final HallRepository hallRepository;

    @GetMapping
    public List<String> halls() {
        return hallRepository.findAllByOrderByNameAsc().stream()
                .map(h -> h.getName())
                .toList();
    }
}
