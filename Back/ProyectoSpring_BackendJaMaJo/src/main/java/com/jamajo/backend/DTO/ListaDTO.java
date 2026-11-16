package com.jamajo.backend.DTO;

public class ListaDTO {
    private Long id;
    private Long idCuenta;
    private String nombre;

    public ListaDTO(Long id, Long idCuenta, String nombre) {
        this.id = id;
        this.idCuenta = idCuenta;
        this.nombre = nombre;
    }

    public Long getId() { return id; }
    public Long getIdCuenta() { return idCuenta; }
    public String getNombre() { return nombre; }
}