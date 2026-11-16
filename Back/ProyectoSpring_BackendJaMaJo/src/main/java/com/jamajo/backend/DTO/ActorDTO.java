package com.jamajo.backend.DTO;

public class ActorDTO {

    private Long id;
    private String nombre;
    private String rutaFoto;
    private String rolEnContenido;

    public ActorDTO(Long id, String nombre, String rutaFoto, String rolEnContenido) {
        this.id = id;
        this.nombre = nombre;
        this.rutaFoto = rutaFoto;
        this.rolEnContenido = rolEnContenido;
    }

    public Long getId() { return id; }
    public String getNombre() { return nombre; }
    public String getRutaFoto() { return rutaFoto; }
    public String getRolEnContenido() { return rolEnContenido; }
}