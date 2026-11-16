package com.jamajo.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jamajo.backend.entity.Contenido;
import com.jamajo.backend.entity.Trabajador;
import com.jamajo.backend.service.TrabajadorService;

@RestController
@RequestMapping("/api/trabajadores")
public class TrabajadorController {

    private final TrabajadorService service;

    public TrabajadorController(TrabajadorService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<List<Trabajador>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<Trabajador>> buscar(
            @RequestParam(required = false, defaultValue = "") String q,
            @RequestParam(required = false, defaultValue = "6") int limit) {
        return ResponseEntity.ok(service.findByNombreLike(q, limit));
    }

    @GetMapping("/{id:[0-9]+}")
    public ResponseEntity<Trabajador> getById(@PathVariable Long id) {
        return service.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id:[0-9]+}/filmografia")
    public ResponseEntity<List<Contenido>> getFilmografia(@PathVariable Long id) {
        return ResponseEntity.ok(service.findFilmografia(id));
    }
}
