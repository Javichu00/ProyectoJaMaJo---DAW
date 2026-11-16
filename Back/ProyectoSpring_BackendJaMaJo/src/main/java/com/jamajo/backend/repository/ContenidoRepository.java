package com.jamajo.backend.repository;

import com.jamajo.backend.entity.Contenido;
import com.jamajo.backend.enums.TipoContenido;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContenidoRepository extends JpaRepository<Contenido, Long> {

    @Query("SELECT c FROM Contenido c WHERE c.nVotos IS NOT NULL ORDER BY c.nVotos DESC LIMIT 18")
    List<Contenido> findTop18ByVotos();

    @Query("SELECT c FROM Contenido c WHERE c.nota IS NOT NULL ORDER BY c.nota DESC LIMIT 18")
    List<Contenido> findTop18ByNota();

    @Query("SELECT c FROM Contenido c WHERE c.fecha IS NOT NULL ORDER BY c.fecha DESC LIMIT 18")
    List<Contenido> findTop18ByFecha();

    @Query("SELECT p FROM Pelicula p WHERE p.duracion IS NOT NULL ORDER BY p.duracion DESC LIMIT 18")
    List<Contenido> findTop18Largas();

    @Query("SELECT c FROM Contenido c WHERE c.tituloPrincipal IN :nombres")
    List<Contenido> findByNombres(@Param("nombres") List<String> nombres);

    @Query("SELECT c FROM Contenido c WHERE LOWER(c.tituloPrincipal) LIKE LOWER(CONCAT('%', :q, '%'))")
    Page<Contenido> findByNombreLike(@Param("q") String q, Pageable pageable);

    @Query("SELECT c FROM Contenido c WHERE LOWER(c.tituloPrincipal) LIKE LOWER(CONCAT('%', :q, '%')) AND c.tipoContenido = :tipo")
    Page<Contenido> findByNombreLikeYTipo(@Param("q") String q, @Param("tipo") TipoContenido tipo, Pageable pageable);

    @Query("""
        SELECT c FROM Contenido c
        WHERE c.id IN (
            SELECT pc.contenido.id FROM ContenidoPerteneceACategoria pc
            WHERE pc.categoria.nombreCategoria IN :categorias
            GROUP BY pc.contenido.id
            HAVING COUNT(DISTINCT pc.categoria.nombreCategoria) = :total
        )
    """)
    Page<Contenido> findByCategorias(
        @Param("categorias") List<String> categorias,
        @Param("total") long total,
        Pageable pageable
    );

    @Query("""
        SELECT c FROM Contenido c
        WHERE c.tipoContenido = :tipo
        AND c.id IN (
            SELECT pc.contenido.id FROM ContenidoPerteneceACategoria pc
            WHERE pc.categoria.nombreCategoria IN :categorias
            GROUP BY pc.contenido.id
            HAVING COUNT(DISTINCT pc.categoria.nombreCategoria) = :total
        )
    """)
    Page<Contenido> findByCategoriasYTipo(
        @Param("categorias") List<String> categorias,
        @Param("total") long total,
        @Param("tipo") TipoContenido tipo,
        Pageable pageable
    );

    @Query("""
        SELECT DISTINCT c FROM Contenido c
        WHERE c.id != :id
        AND (
            c.director.id = :directorId
            OR c.id IN (
                SELECT pc.contenido.id FROM ContenidoPerteneceACategoria pc
                WHERE pc.categoria.nombreCategoria IN :categorias
            )
        )
        ORDER BY c.nVotos DESC
    """)
    Page<Contenido> findCandidatosRecomendados(
        @Param("id") Long id,
        @Param("directorId") Long directorId,
        @Param("categorias") List<String> categorias,
        Pageable pageable
    );

    @Query("SELECT COUNT(c) FROM Contenido c")
    Long countTotal();

    @Query("SELECT COUNT(c) FROM Contenido c WHERE c.tipoContenido = 'PELICULA'")
    Long countPeliculas();

    @Query("SELECT COUNT(c) FROM Contenido c WHERE c.tipoContenido = 'SERIE'")
    Long countSeries();
}