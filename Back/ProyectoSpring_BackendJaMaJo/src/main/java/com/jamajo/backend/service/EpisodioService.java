package com.jamajo.backend.service;

import com.jamajo.backend.entity.Episodio;
import com.jamajo.backend.repository.EpisodioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class EpisodioService {

    private final EpisodioRepository episodioRepository;

    public EpisodioService(EpisodioRepository episodioRepository) {
        this.episodioRepository = episodioRepository;
    }

    public List<Episodio> findAll() {
        return episodioRepository.findAll();
    }

    public Optional<Episodio> findById(Long id) {
        return episodioRepository.findById(id);
    }

    public Optional<Episodio> findBySerieAndTemporadaAndEpisodio(
            Long idContenido, Integer nTemporada, Integer nEpisodio) {
        return episodioRepository.findBySerieAndTemporadaAndEpisodio(idContenido, nTemporada, nEpisodio);
    }

    @Transactional
    public Episodio save(Episodio episodio) {
        return episodioRepository.save(episodio);
    }

    @Transactional
    public void deleteById(Long id) {
        episodioRepository.deleteById(id);
    }
    
    public List<Episodio> findBySerieId(Long idContenido) {
        return episodioRepository.findBySerieId(idContenido);
    }
    
}