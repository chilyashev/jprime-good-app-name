package com.jprime.companion.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.List;

@Data
@ConfigurationProperties(prefix = "app.import")
public class ImportProperties {
    private String baseUrl;
    private List<String> halls = List.of("hall A", "hall B", "workshops");
}
