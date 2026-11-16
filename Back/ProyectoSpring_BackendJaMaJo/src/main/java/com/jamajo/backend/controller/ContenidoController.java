package com.jamajo.backend.controller;
import com.jamajo.backend.service.TmdbService;

import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.jamajo.backend.DTO.ActorDTO;
import com.jamajo.backend.entity.Contenido;
import com.jamajo.backend.entity.Pelicula;
import com.jamajo.backend.enums.TipoContenido;
import com.jamajo.backend.repository.ContenidoPerteneceACategoriaRepository;
import com.jamajo.backend.service.ContenidoService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contenidos")
public class ContenidoController {

    private final TmdbService tmdbService;
    private final ContenidoService service;

    public ContenidoController(ContenidoService service, TmdbService tmdbService, ContenidoPerteneceACategoriaRepository categoriaRepo) {
        this.service = service;
        this.tmdbService = tmdbService;
        this.categoriaRepo = categoriaRepo;
    }

    

 // GET /api/contenidos/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getById(@PathVariable Long id) {

        return service.findById(id)
                .map(contenido -> {

                    List<String> categorias = categoriaRepo
                            .findByContenidoId(contenido.getId())
                            .stream()
                            .map(rel -> rel.getCategoria().getNombreCategoria())
                            .toList();

                    Map<String, Object> response = new HashMap<>();

                    response.put("id", contenido.getId());
                    response.put("idApi", contenido.getIdApi());
                    response.put("idTmdb", contenido.getIdTmdb());
                    response.put("tituloPrincipal", contenido.getTituloPrincipal());
                    response.put("descripcion", contenido.getDescripcion());
                    response.put("fecha", contenido.getFecha());
                    response.put("tipoContenido", contenido.getTipoContenido());
                    response.put("director", contenido.getDirector());
                    response.put("imagenUrl", contenido.getImagenUrl());
                    response.put("nota", contenido.getNota());
                    response.put("nVotos", contenido.getNVotos());
                    response.put("trailerUrl", contenido.getTrailerUrl());
                    response.put("categorias", categorias);

                    if (contenido instanceof Pelicula pelicula) {
                        response.put("duracion", pelicula.getDuracion());
                    }

                    return ResponseEntity.ok(response);
                })
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
                    existing.setIdTmdb(c.getIdTmdb());
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
    
    @GetMapping("/{id}/actores")
    public ResponseEntity<List<ActorDTO>> getActores(@PathVariable Long id) {
        return ResponseEntity.ok(service.findActoresByContenido(id));
    }
    
    @GetMapping("/categoria/{nombreCategoria}")
    public ResponseEntity<Page<Contenido>> getByCategoria(
        @PathVariable String nombreCategoria,
        @RequestParam(defaultValue = "0") int page
    ) {
        return ResponseEntity.ok(service.findByCategoria(nombreCategoria, page));
    }
    
    @GetMapping("/top/votados")
    public ResponseEntity<List<Contenido>> topVotados() {
        return ResponseEntity.ok(service.findTop18Votados());
    }

    @GetMapping("/top/puntos")
    public ResponseEntity<List<Contenido>> topPuntos() {
        return ResponseEntity.ok(service.findTop18Puntos());
    }

    @GetMapping("/top/recientes")
    public ResponseEntity<List<Contenido>> topRecientes() {
        return ResponseEntity.ok(service.findTop18Recientes());
    }

    @GetMapping("/top/largas")
    public ResponseEntity<List<Contenido>> topLargas() {
        return ResponseEntity.ok(service.findTop18Largas());
    }

    @PostMapping("/top/por-nombres")
    public ResponseEntity<List<Contenido>> topPorNombres(@RequestBody List<String> nombres) {
        return ResponseEntity.ok(service.findByNombres(nombres));
    }

    

    @GetMapping("/buscar") 
    public ResponseEntity<Page<Contenido>> buscar(
            @RequestParam String q,
            @RequestParam(required = false) TipoContenido tipo,
            @RequestParam(required = false, defaultValue = "puntos") String orden,
            @RequestParam(required = false, defaultValue = "desc") String dir,
            @RequestParam(required = false, defaultValue = "0") int page) {
        return ResponseEntity.ok(service.buscarPorNombre(q, tipo, orden, dir, page));
    }

    @GetMapping("/por-categorias")
    public ResponseEntity<Page<Contenido>> porCategorias(
            @RequestParam List<String> categorias,
            @RequestParam(required = false) TipoContenido tipo,
            @RequestParam(required = false, defaultValue = "puntos") String orden,
            @RequestParam(required = false, defaultValue = "desc") String dir,
            @RequestParam(required = false, defaultValue = "0") int page) {
        return ResponseEntity.ok(service.buscarPorCategorias(categorias, tipo, orden, dir, page));
    }

    @GetMapping("/{id}/recomendados")
    public ResponseEntity<List<Contenido>> recomendados(@PathVariable Long id) {
        return ResponseEntity.ok(service.findRecomendados(id));
    }
    
    @GetMapping("/contar")
    public ResponseEntity<Map<String, Long>> contar() {
        return ResponseEntity.ok(service.contarContenido());
    }
    
    private final ContenidoPerteneceACategoriaRepository categoriaRepo;
    
    
    
}