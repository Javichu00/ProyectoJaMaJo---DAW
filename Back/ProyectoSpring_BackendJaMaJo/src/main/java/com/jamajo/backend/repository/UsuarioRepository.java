package com.jamajo.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jamajo.backend.entity.Usuario;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, String> {


    @Query("""
            SELECT CASE 
                WHEN COUNT(u) > 0 THEN true 
                ELSE false 
            END
            FROM Usuario u
            WHERE u.email = :email
            AND u.password = :supuestaPassword
        """)
        boolean checkPassword(String email, String supuestaPassword);

    @Query("SELECT u FROM Usuario u WHERE u.fechaFin IS NOT NULL AND u.fechaFin < :hoy")
    List<Usuario> findByFechaFinBefore(@Param("hoy") LocalDate hoy);
    
    Optional<Usuario> findByResetToken(Integer token);
    
}