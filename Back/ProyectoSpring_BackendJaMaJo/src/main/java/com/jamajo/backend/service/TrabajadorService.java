package com.jamajo.backend.service;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jamajo.backend.entity.Contenido;
import com.jamajo.backend.entity.Trabajador;
import com.jamajo.backend.repository.TrabajadorRepository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class TrabajadorService {

    private final TrabajadorRepository trabajadorRepository;

    public TrabajadorService(TrabajadorRepository trabajadorRepository) {
        this.trabajadorRepository = trabajadorRepository;
    }

    public List<Trabajador> findAll() {
        return trabajadorRepository.findAll();
    }

    public Optional<Trabajador> findById(Long id) {
        return trabajadorRepository.findById(id);
    }

    public List<Trabajador> findByNombreLike(String q, int limit) {
        String term = q == null ? "" : q.trim();
        if (term.isBlank()) {
            return List.of();
        }

        int safeLimit = Math.max(1, Math.min(limit, 12));
        return trabajadorRepository.findByNombreLike(term, PageRequest.of(0, safeLimit));
    }

    @Transactional
    public Trabajador save(Trabajador trabajador) {
        return trabajadorRepository.save(trabajador);
    }

    @Transactional
    public void deleteById(Long id) {
        trabajadorRepository.deleteById(id);
    }
    
    public List<Contenido> findFilmografia(Long id) {
        trabajadorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Trabajador no encontrado: " + id));

        Set<Long> vistos = new HashSet<>();
        List<Contenido> resultado = new ArrayList<>();

        for (Contenido c : trabajadorRepository.findContenidosComoDirector(id)) {
            if (vistos.add(c.getId())) resultado.add(c);
        }
        for (Contenido c : trabajadorRepository.findContenidosComoActor(id)) {
            if (vistos.add(c.getId())) resultado.add(c);
        }

        resultado.sort(Comparator.comparingDouble(Contenido::getNota).reversed());
        return resultado;
    }
    
}
