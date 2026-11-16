package com.jamajo.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria")
public class Categoria {

    @Id
    @Column(name = "nombreCategoria")
    private String nombreCategoria;

    public Categoria() {
    }

    public Categoria(String nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
    }

    public String getNombreCategoria() {
        return nombreCategoria;
    }

    public void setNombreCategoria(String nombreCategoria) {
        this.nombreCategoria = nombreCategoria;
    }
}