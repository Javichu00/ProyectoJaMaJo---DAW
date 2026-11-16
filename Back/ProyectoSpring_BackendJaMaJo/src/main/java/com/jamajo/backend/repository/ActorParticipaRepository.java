package com.jamajo.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jamajo.backend.entity.ActorParticipa;

@Repository
public interface ActorParticipaRepository extends JpaRepository<ActorParticipa, Long> {
	
	@Query("SELECT ap FROM ActorParticipa ap WHERE ap.contenido.id = :idContenido")
	List<ActorParticipa> findByContenidoId(@Param("idContenido") Long idContenido);
}