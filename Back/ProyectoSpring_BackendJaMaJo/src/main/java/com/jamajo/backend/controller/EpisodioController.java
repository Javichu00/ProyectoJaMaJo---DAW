package com.jamajo.backend.controller;

import com.jamajo.backend.entity.Episodio;
import com.jamajo.backend.service.EpisodioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/episodios")
public class EpisodioController {

    private final EpisodioService episodioService;

    public EpisodioController(EpisodioService episodioService) {
        this.episodioService = episodioService;
    }

    @GetMapping("/contenido/{idContenido}/temporada/{nTemporada}/episodio/{nEpisodio}")
    public ResponseEntity<Episodio> getBySerieTemporadaEpisodio(
            @PathVariable Long idContenido,
            @PathVariable Integer nTemporada,
            @PathVariable Integer nEpisodio) {
        return episodioService
                .findBySerieAndTemporadaAndEpisodio(idContenido, nTemporada, nEpisodio)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/serie/{idContenido}")
    public ResponseEntity<List<Episodio>> getBySerie(@PathVariable Long idContenido) {
        return ResponseEntity.ok(episodioService.findBySerieId(idContenido));
    }
    
}