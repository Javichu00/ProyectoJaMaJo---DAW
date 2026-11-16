package com.jamajo.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Lista")
public class Lista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lista")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_cuenta", nullable = false)
    private Cuenta cuenta;

    private String nombre;

    public Lista() {}

    public Lista(Long id, Cuenta cuenta, String nombre) {
        this.id = id;
        this.cuenta = cuenta;
        this.nombre = nombre;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Cuenta getCuenta() { return cuenta; }
    public void setCuenta(Cuenta cuenta) { this.cuenta = cuenta; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
}