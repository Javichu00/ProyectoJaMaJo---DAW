package com.jamajo.backend.DTO;

public class ResenaCreateDTO {

    private Long idCuenta;
    private Long idContenido;
    private String texto;
    private Integer puntuacion;

    public Long getIdCuenta() { return idCuenta; }
    public Long getIdContenido() { return idContenido; }
    public String getTexto() { return texto; }
    public Integer getPuntuacion() { return puntuacion; }
}