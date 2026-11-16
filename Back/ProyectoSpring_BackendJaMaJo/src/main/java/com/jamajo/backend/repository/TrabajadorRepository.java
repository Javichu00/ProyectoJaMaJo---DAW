package com.jamajo.backend.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jamajo.backend.entity.Contenido;
import com.jamajo.backend.entity.Trabajador;

@Repository
public interface TrabajadorRepository extends JpaRepository<Trabajador, Long> {
	
	@Query("SELECT c FROM Contenido c WHERE c.director.id = :id")
	List<Contenido> findContenidosComoDirector(@Param("id") Long id);

	@Query("SELECT ap.contenido FROM ActorParticipa ap WHERE ap.trabajador.id = :id")
	List<Contenido> findContenidosComoActor(@Param("id") Long id);

	@Query("""
		SELECT t FROM Trabajador t
		WHERE LOWER(t.nombre) LIKE LOWER(CONCAT('%', :q, '%'))
		ORDER BY
			CASE
				WHEN LOWER(t.nombre) = LOWER(:q) THEN 0
				WHEN LOWER(t.nombre) LIKE LOWER(CONCAT(:q, '%')) THEN 1
				WHEN LOWER(t.nombre) LIKE LOWER(CONCAT('% ', :q, '%')) THEN 2
				ELSE 3
			END,
			t.nombre ASC
	""")
	List<Trabajador> findByNombreLike(@Param("q") String q, Pageable pageable);
	
	
}
