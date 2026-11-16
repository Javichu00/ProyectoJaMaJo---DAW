package com.jamajo.backend.repository;

import com.jamajo.backend.entity.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ResenaRepository extends JpaRepository<Resena, Long> {

	List<Resena> findByCuentaIdCuenta(Long idCuenta);
	
	List<Resena> findByContenidoId(Long idContenido);
	
	Optional<Resena> findByCuentaIdCuentaAndContenidoId(Long idCuenta, Long idContenido);

	@Query("SELECT AVG(r.puntuacion) FROM Resena r WHERE r.contenido.id = :idContenido")
	Double mediaByContenido(@Param("idContenido") Long idContenido);
}