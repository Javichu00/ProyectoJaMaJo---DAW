package com.jamajo.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Serie")
@PrimaryKeyJoinColumn(name = "id_contenido")
@DiscriminatorValue("SERIE")
public class Serie extends Contenido {
    
    public Serie() {
    }
}