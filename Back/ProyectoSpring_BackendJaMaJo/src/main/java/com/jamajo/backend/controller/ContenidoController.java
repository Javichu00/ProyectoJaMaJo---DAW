package com.jamajo.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.jamajo.backend.entity.Contenido;
import com.jamajo.backend.service.ContenidoService;
import java.util.List;

@RestController
@RequestMapping("/api/contenidos")
public class ContenidoController {

    private final ContenidoService service;

    public ContenidoController(ContenidoService service) {
        this.service = service;
    }

    // GET /api/contenidos
    @GetMapping
    public ResponseEntity<List<Contenido>> getAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // GET /api/contenidos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Contenido> getById(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/contenidos
    @PostMapping
    public ResponseEntity<Contenido> create(@RequestBody Contenido c) {
        return ResponseEntity.ok(service.save(c));
    }

    // PUT /api/contenidos/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Contenido> update(@PathVariable Long id,
                                            @RequestBody Contenido c) {
        return service.findById(id)
                .map(existing -> {
                    existing.setIdApi(c.getIdApi());
                    existing.setTituloPrincipal(c.getTituloPrincipal());
                    existing.setDescripcion(c.getDescripcion());
                    existing.setFecha(c.getFecha());
                    existing.setTipoContenido(c.getTipoContenido());
                    existing.setDirector(c.getDirector());
                    existing.setImagenUrl(c.getImagenUrl());
                    existing.setNota(c.getNota());
                    existing.setNVotos(c.getNVotos());
                    existing.setTrailerUrl(c.getTrailerUrl());
                    return ResponseEntity.ok(service.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/contenidos/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (service.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}