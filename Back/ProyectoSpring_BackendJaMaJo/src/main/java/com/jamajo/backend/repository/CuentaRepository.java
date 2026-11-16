package com.jamajo.backend.repository;

import com.jamajo.backend.entity.Cuenta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CuentaRepository extends JpaRepository<Cuenta, Long> {
    List<Cuenta> findByEmail(String email);
    List<Cuenta> findByEmailOrderByIdCuentaAsc(String email);
}