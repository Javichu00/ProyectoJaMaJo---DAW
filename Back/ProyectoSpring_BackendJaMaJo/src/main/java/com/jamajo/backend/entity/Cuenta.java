package com.jamajo.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "Cuenta")
public class Cuenta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cuenta")
    private Long idCuenta;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String username;

    @Column(name = "id_foto")
    private Integer idFoto;

    @ManyToOne
    @JoinColumn(name = "email", insertable = false, updatable = false)
    private Usuario usuario;

    public Cuenta() {}

    public Cuenta(String email, String username, Integer idFoto) {
        this.email = email;
        this.username = username;
        this.idFoto = idFoto;
    }

    public Long getIdCuenta() { return idCuenta; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Integer getIdFoto() { return idFoto; }
    public void setIdFoto(Integer idFoto) { this.idFoto = idFoto; }
}