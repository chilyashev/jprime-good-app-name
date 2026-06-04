package com.jprime.companion.client;

import com.jprime.companion.config.ImportProperties;
import com.jprime.companion.entity.Session;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class JprimeClient {

    private final RestClient restClient;
    private final String baseUrl;

    public JprimeClient(ImportProperties props) {
        this.baseUrl = props.getBaseUrl();
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }

    public List<Session> fetchByHall(String hallName) {
        if (hallName != null) {
            return restClient.get()
                    .uri("/pwa/findSessionsByHall?hallName={hall}", hallName)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
        }
        return restClient.get()
                .uri("/pwa/findSessionsByHall")
                .retrieve()
                .body(new ParameterizedTypeReference<>() {});
    }

    public Map<String, Long> fetchSpeakerIdsByName() {
        String html = restClient.get().uri("/speakers").retrieve().body(String.class);
        Document doc = Jsoup.parse(html, baseUrl);
        Map<String, Long> result = new HashMap<>();
        doc.select("a[href]").forEach(a -> {
            String href = a.attr("href");
            if (href.matches("/speaker/\\d+")) {
                String name = a.text().replace(" ", " ").trim();
                if (!name.isBlank()) {
                    long id = Long.parseLong(href.substring("/speaker/".length()));
                    result.put(name, id);
                }
            }
        });
        return result;
    }

    public String fetchSpeakerBio(long speakerId) {
        String html = restClient.get().uri("/speaker/{id}", speakerId).retrieve().body(String.class);
        Document doc = Jsoup.parse(html);
        return doc.select("p").stream()
                .map(el -> el.text().trim())
                .filter(text -> text.length() > 50)
                .findFirst()
                .orElse(null);
    }
}
