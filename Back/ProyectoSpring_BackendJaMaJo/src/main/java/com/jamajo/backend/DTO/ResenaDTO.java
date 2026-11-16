package com.jamajo.backend.DTO;

import java.time.LocalDateTime;

public class ResenaDTO {

    private Long idResena;
    private Long idCuenta;
    private Long idContenido;
    private String texto;
    private Integer puntuacion;
    private LocalDateTime fechaCreacion;

    public ResenaDTO(Long idResena, Long idCuenta, Long idContenido, String texto, Integer puntuacion, LocalDateTime fechaCreacion) {
        this.idResena = idResena;
        this.idCuenta = idCuenta;
        this.idContenido = idContenido;
        this.texto = texto;
        this.puntuacion = puntuacion;
        this.fechaCreacion = fechaCreacion;
    }

    public Long getIdResena() { return idResena; }
    public Long getIdCuenta() { return idCuenta; }
    public Long getIdContenido() { return idContenido; }
    public String getTexto() { return texto; }
    public Integer getPuntuacion() { return puntuacion; }
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
}