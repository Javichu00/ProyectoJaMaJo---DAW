package com.jamajo.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "ListaTieneContenido")
public class ListaTieneContenido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ltc")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_lista", nullable = false)
    private Lista lista;

    @ManyToOne
    @JoinColumn(name = "id_contenido", nullable = false)
    private Contenido contenido;

    public ListaTieneContenido() {
    }

    public ListaTieneContenido(Long id, Lista lista, Contenido contenido) {
        this.id = id;
        this.lista = lista;
        this.contenido = contenido;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Lista getLista() {
        return lista;
    }

    public void setLista(Lista lista) {
        this.lista = lista;
    }

    public Contenido getContenido() {
        return contenido;
    }

    public void setContenido(Contenido contenido) {
        this.contenido = contenido;
    }
}