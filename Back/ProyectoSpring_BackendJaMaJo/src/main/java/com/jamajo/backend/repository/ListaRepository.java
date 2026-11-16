package com.jamajo.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.jamajo.backend.entity.Lista;

@Repository
public interface ListaRepository extends JpaRepository<Lista, Long> {

    @Query("SELECT l FROM Lista l WHERE l.cuenta.idCuenta = :idCuenta")
    List<Lista> findByCuentaIdCuenta(@Param("idCuenta") Long idCuenta);

    @Query("SELECT COUNT(l) FROM Lista l WHERE l.cuenta.idCuenta = :idCuenta")
    long countByCuentaIdCuenta(@Param("idCuenta") Long idCuenta);
}