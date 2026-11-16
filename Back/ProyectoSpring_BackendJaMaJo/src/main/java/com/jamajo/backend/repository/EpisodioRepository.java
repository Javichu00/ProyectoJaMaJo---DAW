package com.jamajo.backend.repository;

import com.jamajo.backend.entity.Episodio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EpisodioRepository extends JpaRepository<Episodio, Long> {

    @Query("""
        SELECT e FROM Episodio e
        WHERE e.temporada.serie.id = :idContenido
          AND e.temporada.numeroTemporada = :nTemporada
          AND e.numeroEpisodio = :nEpisodio
    """)
    Optional<Episodio> findBySerieAndTemporadaAndEpisodio(
        @Param("idContenido") Long idContenido,
        @Param("nTemporada") Integer nTemporada,
        @Param("nEpisodio") Integer nEpisodio
    );
    
    @Query("SELECT e FROM Episodio e WHERE e.temporada.serie.id = :idContenido ORDER BY e.temporada.numeroTemporada ASC, e.numeroEpisodio ASC")
    List<Episodio> findBySerieId(@Param("idContenido") Long idContenido);
    
}