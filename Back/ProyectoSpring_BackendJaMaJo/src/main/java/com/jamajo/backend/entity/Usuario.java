package com.jamajo.backend.entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.jamajo.backend.enums.TipoUsuario;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Usuarios")
public class Usuario {

    @Id
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "fecha_registro")
    private LocalDate fechaRegistro;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_usuario")
    private TipoUsuario tipoUsuario;

    private Boolean enabled;

    @ManyToOne
    @JoinColumn(name = "nombre_plan", nullable = false)
    private Plan plan;

    @Column(name = "fecha_fin")
    private LocalDate fechaFin;
    
    @Column(name = "reset_token")
    private Integer resetToken;

    @Column(name = "reset_token_expira")
    private LocalDateTime resetTokenExpira;



    public Usuario() {}

    public Usuario(String email, String username, String password, LocalDate fechaRegistro, TipoUsuario tipoUsuario, Boolean enabled, Plan plan, LocalDate fechaFin) {
        this.email = email;
        this.password = password;
        this.fechaRegistro = fechaRegistro;
        this.tipoUsuario = tipoUsuario;
        this.enabled = enabled;
        this.plan = plan;
        this.fechaFin = fechaFin;
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDate getFechaRegistro() { return fechaRegistro; }
    public void setFechaRegistro(LocalDate fechaRegistro) { this.fechaRegistro = fechaRegistro; }

    public TipoUsuario getTipoUsuario() { return tipoUsuario; }
    public void setTipoUsuario(TipoUsuario tipoUsuario) { this.tipoUsuario = tipoUsuario; }

    public Boolean getEnabled() { return enabled; }
    public void setEnabled(Boolean enabled) { this.enabled = enabled; }

    public Plan getPlan() { return plan; }
    public void setPlan(Plan plan) { this.plan = plan; }

    public LocalDate getFechaFin() { return fechaFin; }
    public void setFechaFin(LocalDate fechaFin) { this.fechaFin = fechaFin; }

	public Integer getResetToken() {
		return resetToken;
	}

	public void setResetToken(Integer resetToken) {
		this.resetToken = resetToken;
	}

	public LocalDateTime getResetTokenExpira() {
		return resetTokenExpira;
	}

	public void setResetTokenExpira(LocalDateTime resetTokenExpira) {
		this.resetTokenExpira = resetTokenExpira;
	}
    
    
}