package com.jamajo.backend.DTO;

public class UsuarioUpdateDTO {

    private Boolean enabled;
    private String tipoUsuario;
    private String password;

    public Boolean getEnabled() { return enabled; }
    public String getTipoUsuario() { return tipoUsuario; }
    public String getPassword() { return password; }

    public UsuarioUpdateDTO(Boolean enabled, String tipoUsuario, String password) {
        this.enabled = enabled;
        this.tipoUsuario = tipoUsuario;
        this.password = password;
    }
}