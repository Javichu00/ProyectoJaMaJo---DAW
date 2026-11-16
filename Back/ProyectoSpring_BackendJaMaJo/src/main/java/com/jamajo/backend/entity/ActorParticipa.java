package com.jamajo.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "actorparticipa")
public class ActorParticipa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_relacion")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_contenido", nullable = false)
    private Contenido contenido;

    @ManyToOne
    @JoinColumn(name = "id_trabajador", nullable = false)
    private Trabajador trabajador;

    @Column(name = "rol_en_contenido")
    private String rolEnContenido;

    public ActorParticipa() {
    }

    public ActorParticipa(Long id, Contenido contenido, Trabajador trabajador, String rolEnContenido) {
        this.id = id;
        this.contenido = contenido;
        this.trabajador = trabajador;
        this.rolEnContenido = rolEnContenido;
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

    public Trabajador getTrabajador() {
        return trabajador;
    }

    public void setTrabajador(Trabajador trabajador) {
        this.trabajador = trabajador;
    }

    public String getRolEnContenido() {
        return rolEnContenido;
    }

    public void setRolEnContenido(String rolEnContenido) {
        this.rolEnContenido = rolEnContenido;
    }
}