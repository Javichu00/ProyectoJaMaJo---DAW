package com.jamajo.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "Resena")
public class Resena {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_resena")
    private Long idResena;

    @ManyToOne
    @JoinColumn(name = "id_cuenta", nullable = false)
    private Cuenta cuenta;

    @ManyToOne
    @JoinColumn(name = "id_contenido", nullable = false)
    private Contenido contenido;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String texto;

    @Column(nullable = false)
    private Integer puntuacion;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    public Resena() {}

    @PrePersist
    public void prePersist() {
        this.fechaCreacion = LocalDateTime.now();
    }

    public Long getIdResena() { return idResena; }
    public Cuenta getCuenta() { return cuenta; }
    public void setCuenta(Cuenta cuenta) { this.cuenta = cuenta; }
    public Contenido getContenido() { return contenido; }
    public void setContenido(Contenido contenido) { this.contenido = contenido; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
    public Integer getPuntuacion() { return puntuacion; }
    public void setPuntuacion(Integer puntuacion) { this.puntuacion = puntuacion; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
}