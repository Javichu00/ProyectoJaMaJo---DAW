package com.jamajo.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "Planes")
public class Plan {

    @Id
    private String nombrePlan;

    @Column(nullable = false)
    private Double precio;

    public Plan() {}

    public Plan(String nombrePlan, Double precio) {
        this.nombrePlan = nombrePlan;
        this.precio = precio;
    }

    public String getNombrePlan() { return nombrePlan; }
    public void setNombrePlan(String nombrePlan) { this.nombrePlan = nombrePlan; }

    public Double getPrecio() { return precio; }
    public void setPrecio(Double precio) { this.precio = precio; }
}