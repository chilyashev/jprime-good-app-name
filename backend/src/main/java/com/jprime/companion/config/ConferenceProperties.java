package com.jprime.companion.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.conference")
public class ConferenceProperties {

    private String venueName = "jPrime 2026 Venue";
    private String venueAddress = "Inter Expo Center Sofia · Tsarigradsko Shose Blvd 147, Sofia";
    private String venueMapUrl = "https://maps.google.com/maps?q=Inter+Expo+Center+Sofia+Bulgaria&output=embed";
}
