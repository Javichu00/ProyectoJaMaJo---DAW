package com.jamajo.backend.DTO;

public class CuentaDTO {
    private Long idCuenta;
    private String email;
    private String username;
    private Integer idFoto;

    public CuentaDTO(Long idCuenta, String email, String username, Integer idFoto) {
        this.idCuenta = idCuenta;
        this.email = email;
        this.username = username;
        this.idFoto = idFoto;
    }

    public Long getIdCuenta() { return idCuenta; }
    public String getEmail() { return email; }
    public String getUsername() { return username; }
    public Integer getIdFoto() { return idFoto; }
}