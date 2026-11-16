package com.jamajo.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "trabajadores")
public class Trabajador {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_trabajador")
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nombre;

    @Column(name = "rutaFoto", columnDefinition = "TEXT")
    private String rutaFoto;

    public Trabajador() {}

    public Trabajador(Long id, String nombre, String rutaFoto) {
        this.id = id;
        this.nombre = nombre;
        this.rutaFoto = rutaFoto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getRutaFoto() { return rutaFoto; }
    public void setRutaFoto(String rutaFoto) { this.rutaFoto = rutaFoto; }
}