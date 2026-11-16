package com.jamajo.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jamajo.backend.DTO.TmdbImageDTO;
import com.jamajo.backend.service.TmdbService;

@RestController
@RequestMapping("/api/tmdb")
public class TmdbController {

    private final TmdbService tmdbService;

    public TmdbController(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    @GetMapping("/{id}/movieImages")
    public List<TmdbImageDTO> getMovieImages(@PathVariable String id) {
        return tmdbService.getMovieImages(id);
    }
    
    @GetMapping("/{id}/serieImages")
    public List<TmdbImageDTO> getseriesImages(@PathVariable String id) {
        return tmdbService.getSerieImages(id);
    }
    
    @GetMapping("/{tvId}/season/{season}/episode/{episode}/images")
    public String getEpisodeStill(
            @PathVariable String tvId,
            @PathVariable int season,
            @PathVariable int episode) {

        return tmdbService.getEpisodeImages(tvId, season, episode);
    }
    
}