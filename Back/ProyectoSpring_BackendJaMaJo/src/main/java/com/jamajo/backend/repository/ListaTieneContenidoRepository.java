package com.jamajo.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.jamajo.backend.entity.ListaTieneContenido;

@Repository
public interface ListaTieneContenidoRepository extends JpaRepository<ListaTieneContenido, Long> {
    List<ListaTieneContenido> findByListaId(Long idLista);
    Optional<ListaTieneContenido> findByListaIdAndContenidoId(Long idLista, Long idContenido);
    void deleteByListaIdAndContenidoId(Long idLista, Long idContenido);
} 