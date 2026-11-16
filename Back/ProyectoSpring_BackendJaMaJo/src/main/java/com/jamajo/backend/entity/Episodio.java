package com.jamajo.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "episodio")
public class Episodio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_episodio")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_temporada", nullable = false)
    private Temporada temporada;

    @Column(name = "numero_episodio")
    private Integer numeroEpisodio;

    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private Integer duracion;

    @Column(name = "fecha_emision")
    private LocalDate fechaEmision;

    public Episodio() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Temporada getTemporada() { return temporada; }
    public void setTemporada(Temporada temporada) { this.temporada = temporada; }

    public Integer getNumeroEpisodio() { return numeroEpisodio; }
    public void setNumeroEpisodio(Integer numeroEpisodio) { this.numeroEpisodio = numeroEpisodio; }

    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public Integer getDuracion() { return duracion; }
    public void setDuracion(Integer duracion) { this.duracion = duracion; }

    public LocalDate getFechaEmision() { return fechaEmision; }
    public void setFechaEmision(LocalDate fechaEmision) { this.fechaEmision = fechaEmision; }
}