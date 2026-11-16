package com.jamajo.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.jamajo.backend.entity.Pago;
import com.jamajo.backend.entity.Usuario;
import java.util.List;

@Repository
public interface PagoRepository extends JpaRepository<Pago, Long> {
    List<Pago> findByUsuarioOrderByFechaPagoDesc(Usuario usuario);
}