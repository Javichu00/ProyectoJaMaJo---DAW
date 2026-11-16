package com.jamajo.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ContenidoPerteneceACategoria")
public class ContenidoPerteneceACategoria {

    @Id
    @Column(name="id_relacion")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_contenido", nullable = false)
    private Contenido contenido;

    @ManyToOne
    @JoinColumn(name = "nombreCategoria", nullable = false)
    private Categoria categoria;

    public ContenidoPerteneceACategoria() {
    }

    public ContenidoPerteneceACategoria(Long id, Contenido contenido, Categoria categoria) {
        this.id = id;
        this.contenido = contenido;
        this.categoria = categoria;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Contenido getContenido() {
        return contenido;
    }

    public void setContenido(Contenido contenido) {
        this.contenido = contenido;
    }

    public Categoria getCategoria() {
        return categoria;
    }

    public void setCategoria(Categoria categoria) {
        this.categoria = categoria;
    }
}