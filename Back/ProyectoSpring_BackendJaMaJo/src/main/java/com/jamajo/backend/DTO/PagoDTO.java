package com.jamajo.backend.DTO;

import java.time.LocalDateTime;

public class PagoDTO {
    private Long idPago;
    private String email;
    private String nombrePlan;
    private Double importe;
    private LocalDateTime fechaPago;

    public PagoDTO(Long idPago, String email, String nombrePlan, Double importe, LocalDateTime fechaPago) {
        this.idPago = idPago;
        this.email = email;
        this.nombrePlan = nombrePlan;
        this.importe = importe;
        this.fechaPago = fechaPago;
    }

    public Long getIdPago() { return idPago; }
    public String getEmail() { return email; }
    public String getNombrePlan() { return nombrePlan; }
    public Double getImporte() { return importe; }
    public LocalDateTime getFechaPago() { return fechaPago; }
}