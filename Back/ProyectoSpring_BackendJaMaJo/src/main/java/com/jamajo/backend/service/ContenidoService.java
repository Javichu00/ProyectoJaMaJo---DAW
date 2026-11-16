package com.jamajo.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.jamajo.backend.DTO.ActorDTO;
import com.jamajo.backend.entity.Contenido;
import com.jamajo.backend.enums.TipoContenido;
import com.jamajo.backend.repository.ActorParticipaRepository;
import com.jamajo.backend.repository.ContenidoPerteneceACategoriaRepository;
import com.jamajo.backend.repository.ContenidoRepository;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ContenidoService {

    private final ContenidoRepository contenidoRepository;
    private final ActorParticipaRepository actorParticipaRepository;
    private final ContenidoPerteneceACategoriaRepository categoriaRepository;

    public ContenidoService(ContenidoRepository contenidoRepository,
            ActorParticipaRepository actorParticipaRepository,
            ContenidoPerteneceACategoriaRepository categoriaRepository) {
        this.contenidoRepository = contenidoRepository;
        this.actorParticipaRepository = actorParticipaRepository;
        this.categoriaRepository = categoriaRepository;
    }

    public List<Contenido> findAll() {
        return contenidoRepository.findAll();
    }

    public Optional<Contenido> findById(Long id) {
        return contenidoRepository.findById(id);
    }

    @Transactional
    public Contenido save(Contenido contenido) {
        return contenidoRepository.save(contenido);
    }

    @Transactional
    public void deleteById(Long id) {
        contenidoRepository.deleteById(id);
    }

    public List<Contenido> findAllOrderedByNotaDesc() {
        return contenidoRepository.findAll(Sort.by(Sort.Direction.DESC, "nota"));
    }

    public List<ActorDTO> findActoresByContenido(Long idContenido) {
        return actorParticipaRepository.findByContenidoId(idContenido)
            .stream()
            .map(ap -> new ActorDTO(
                ap.getTrabajador().getId(),
                ap.getTrabajador().getNombre(),
                ap.getTrabajador().getRutaFoto(),
                ap.getRolEnContenido()
            ))
            .toList();
    }

    public Page<Contenido> findByCategoria(String nombreCategoria, int page) {
        Pageable pageable = PageRequest.of(page, 24);
        return categoriaRepository.findContenidosByCategoria(nombreCategoria, pageable);
    }

    public List<Contenido> findTop18Votados() { return contenidoRepository.findTop18ByVotos(); }
    public List<Contenido> findTop18Puntos()  { return contenidoRepository.findTop18ByNota(); }
    public List<Contenido> findTop18Recientes(){ return contenidoRepository.findTop18ByFecha(); }
    public List<Contenido> findTop18Largas()  { return contenidoRepository.findTop18Largas(); }
    public List<Contenido> findByNombres(List<String> nombres) { return contenidoRepository.findByNombres(nombres); }

    public Page<Contenido> buscarPorNombre(String q, TipoContenido tipo, String orden, String dir, int page) {
        Pageable pageable = buildPageable(page, 24, orden, dir);
        if (tipo == null) return contenidoRepository.findByNombreLike(q, pageable);
        return contenidoRepository.findByNombreLikeYTipo(q, tipo, pageable);
    }

    public Page<Contenido> buscarPorCategorias(List<String> categorias, TipoContenido tipo, String orden, String dir, int page) {
        Pageable pageable = buildPageable(page, 49, orden, dir);
        if (tipo == null) return contenidoRepository.findByCategorias(categorias, categorias.size(), pageable);
        return contenidoRepository.findByCategoriasYTipo(categorias, categorias.size(), tipo, pageable);
    }
    
    public List<Contenido> findRecomendados(Long id) {
        Contenido base = contenidoRepository.findById(id).orElseThrow();

        List<String> categoriasBase = categoriaRepository
            .findByContenidoId(id)
            .stream()
            .map(pc -> pc.getCategoria().getNombreCategoria())
            .toList();

        Long directorId = base.getDirector() != null ? base.getDirector().getId() : -1L;

        List<Contenido> candidatos = contenidoRepository
            .findCandidatosRecomendados(id, directorId, categoriasBase, PageRequest.of(0, 200))
            .getContent();

        List<Long> idsCandidatos = candidatos.stream().map(Contenido::getId).toList();
        Map<Long, List<String>> categoriasPorId = categoriaRepository
            .findByContenidoIds(idsCandidatos)
            .stream()
            .collect(Collectors.groupingBy(
                pc -> pc.getContenido().getId(),
                Collectors.mapping(pc -> pc.getCategoria().getNombreCategoria(), Collectors.toList())
            ));

        String[] palabrasBase = base.getTituloPrincipal().toLowerCase().split("\\s+");
        int anioBase = base.getFecha() != null ? base.getFecha().getYear() : 0;

        return candidatos.stream()
            .map(c -> {
                int score = 0;

                if (c.getDirector() != null && c.getDirector().getId().equals(directorId))
                    score += 40;

                List<String> categoriasC = categoriasPorId.getOrDefault(c.getId(), List.of());
                long compartidas = categoriasC.stream().filter(categoriasBase::contains).count();
                score += compartidas * 15;

                String tituloC = c.getTituloPrincipal().toLowerCase();
                long palabrasCompartidas = Arrays.stream(palabrasBase)
                    .filter(p -> p.length() > 3 && tituloC.contains(p))
                    .count();
                score += palabrasCompartidas * 20;

                if (anioBase > 0 && c.getFecha() != null) {
                    int diff = Math.abs(c.getFecha().getYear() - anioBase);
                    if (diff <= 2) score += 10;
                    else if (diff <= 5) score += 5;
                }

                return Map.entry(c, score);
            })
            .sorted(Map.Entry.<Contenido, Integer>comparingByValue().reversed())
            .limit(12)
            .map(Map.Entry::getKey)
            .toList();
    }

    private Pageable buildPageable(int page, int size, String orden, String dir) {
        Sort.Direction direction = "desc".equalsIgnoreCase(dir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        String campo = switch (orden == null ? "" : orden.toLowerCase()) {
            case "votos"      -> "nVotos";
            case "puntos"     -> "nota";
            case "fecha"      -> "fecha";
            case "alfabetico" -> "tituloPrincipal";
            default           -> "nota";
        };
        return PageRequest.of(page, size, Sort.by(direction, campo));
    }

    public Map<String, Long> contarContenido() {
        return Map.of(
            "totalContenido", contenidoRepository.countTotal(),
            "totalPeliculas", contenidoRepository.countPeliculas(),
            "totalSeries",    contenidoRepository.countSeries()
        );
    }
}