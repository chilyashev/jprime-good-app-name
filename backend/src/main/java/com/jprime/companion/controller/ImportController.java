package com.jprime.companion.controller;

import com.jprime.companion.service.ImportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/import")
@RequiredArgsConstructor
public class ImportController {

    private final ImportService importService;

    @PostMapping
    public ResponseEntity<Void> triggerImport() {
        importService.importAll();
        return ResponseEntity.ok().build();
    }
}
