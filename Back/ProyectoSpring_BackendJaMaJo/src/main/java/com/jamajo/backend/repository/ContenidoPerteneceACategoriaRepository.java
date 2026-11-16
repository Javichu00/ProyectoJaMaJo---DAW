package com.jamajo.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.jamajo.backend.entity.ContenidoPerteneceACategoria;
import com.jamajo.backend.entity.Contenido;
import java.util.List;

@Repository
public interface ContenidoPerteneceACategoriaRepository extends JpaRepository<ContenidoPerteneceACategoria, Long> {

	@Query(value = "SELECT c.contenido FROM ContenidoPerteneceACategoria c WHERE c.categoria.nombreCategoria = :nombreCategoria ORDER BY c.contenido.nVotos DESC",
		       countQuery = "SELECT COUNT(c) FROM ContenidoPerteneceACategoria c WHERE c.categoria.nombreCategoria = :nombreCategoria")
		Page<Contenido> findContenidosByCategoria(@Param("nombreCategoria") String nombreCategoria, Pageable pageable);

    List<ContenidoPerteneceACategoria> findByContenidoId(Long contenidoId);

    @Query("SELECT pc FROM ContenidoPerteneceACategoria pc WHERE pc.contenido.id IN :ids")
    List<ContenidoPerteneceACategoria> findByContenidoIds(@Param("ids") List<Long> ids);
}