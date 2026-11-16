package com.jamajo.backend.DTO;

import java.time.LocalDate;
import com.jamajo.backend.enums.TipoUsuario;

public class UsuarioDTO {
    private String email;
    private LocalDate fechaRegistro;
    private TipoUsuario tipoUsuario;
    private Boolean enabled;
    private String nombrePlan;
    private LocalDate fechaFin;

    public UsuarioDTO(String email, LocalDate fechaRegistro, TipoUsuario tipoUsuario, Boolean enabled, String nombrePlan, LocalDate fechaFin) {
        this.email = email;
        this.fechaRegistro = fechaRegistro;
        this.tipoUsuario = tipoUsuario;
        this.enabled = enabled;
        this.nombrePlan = nombrePlan;
        this.fechaFin = fechaFin;
    }

    public String getEmail() { return email; }
    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public TipoUsuario getTipoUsuario() { return tipoUsuario; }
    public Boolean getEnabled() { return enabled; }
    public String getNombrePlan() { return nombrePlan; }
    public LocalDate getFechaFin() { return fechaFin; }
}