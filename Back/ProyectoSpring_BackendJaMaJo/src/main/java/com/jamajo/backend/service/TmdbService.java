package com.jamajo.backend.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.jamajo.backend.DTO.TmdbImageDTO;
import com.jamajo.backend.DTO.TmdbResponse;

@Service
public class TmdbService {

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Value("${tmdb.api.base-url}")
    private String baseUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public List<TmdbImageDTO> getMovieImages(String id) {

        String url = baseUrl + "/movie/" + id + "/images?api_key=" + apiKey;

        ResponseEntity<TmdbResponse> response =
                restTemplate.getForEntity(url, TmdbResponse.class);

        TmdbResponse body = response.getBody();

        if (body == null || body.getBackdrops() == null) {
            return List.of();
        }

        return body.getBackdrops()
                .stream()
                .map(img -> new TmdbImageDTO(
                        "https://image.tmdb.org/t/p/original" + img.getFilePath(),
                        img.getWidth(),
                        img.getHeight()
                ))
                .toList();
    }
    
    public List<TmdbImageDTO> getSerieImages(String id) {

        String url = baseUrl + "/tv/" + id + "/images?api_key=" + apiKey;

        ResponseEntity<TmdbResponse> response =
                restTemplate.getForEntity(url, TmdbResponse.class);

        TmdbResponse body = response.getBody();

        if (body == null || body.getBackdrops() == null) {
            return List.of();
        }

        return body.getBackdrops()
                .stream()
                .map(img -> new TmdbImageDTO(
                        "https://image.tmdb.org/t/p/original" + img.getFilePath(),
                        img.getWidth(),
                        img.getHeight()
                ))
                .toList();
    }
    
    public String getEpisodeImages(String tvId, int season, int episode) {

        String url = baseUrl + "/tv/" + tvId
                + "/season/" + season
                + "/episode/" + episode
                + "?api_key=" + apiKey;

        ResponseEntity<Map> response =
                restTemplate.getForEntity(url, Map.class);

        Map body = response.getBody();

        if (body == null || body.get("still_path") == null) {
            return null;
        }

        return "https://image.tmdb.org/t/p/original" + body.get("still_path");
    }
}