package com.jprime.companion.client;

import com.jprime.companion.entity.Session;
import com.jprime.companion.config.ImportProperties;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

@Component
public class JprimeClient {

    private final RestClient restClient;

    public JprimeClient(ImportProperties props) {
        this.restClient = RestClient.builder()
                .baseUrl(props.getBaseUrl())
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
}
