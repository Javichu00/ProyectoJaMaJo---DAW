package com.jamajo.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Pagos")
public class Pago {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_pago")
    private Long idPago;

    @ManyToOne
    @JoinColumn(name = "email", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "nombrePlan", nullable = false)
    private Plan plan;

    @Column(nullable = false)
    private Double importe;

    @Column(name = "fecha_pago", nullable = false)
    private LocalDateTime fechaPago;

    public Pago() {}

    public Pago(Usuario usuario, Plan plan, Double importe, LocalDateTime fechaPago) {
        this.usuario = usuario;
        this.plan = plan;
        this.importe = importe;
        this.fechaPago = fechaPago;
    }

    public Long getIdPago() { return idPago; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public Plan getPlan() { return plan; }
    public void setPlan(Plan plan) { this.plan = plan; }

    public Double getImporte() { return importe; }
    public void setImporte(Double importe) { this.importe = importe; }

    public LocalDateTime getFechaPago() { return fechaPago; }
    public void setFechaPago(LocalDateTime fechaPago) { this.fechaPago = fechaPago; }
}