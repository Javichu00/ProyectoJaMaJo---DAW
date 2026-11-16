package com.jamajo.backend.DTO;

import com.jamajo.backend.enums.TipoContenido;
import java.time.LocalDate;

public class ContenidoDTO {
    private Long id;
    private String idApi;
    private Long idTmdb;
    private String tituloPrincipal;
    private String director;
    private TipoContenido tipoContenido;
    private String descripcion;
    private LocalDate fecha;
    private String imagenUrl;
    private Double nota;
    private Integer nVotos;
    private String trailerUrl;

    public ContenidoDTO(Long id, String idApi, Long idTmdb, String tituloPrincipal,
                        String director, TipoContenido tipoContenido, String descripcion,
                        LocalDate fecha, String imagenUrl, Double nota,
                        Integer nVotos, String trailerUrl) {
        this.id = id;
        this.idApi = idApi;
        this.idTmdb = idTmdb;
        this.tituloPrincipal = tituloPrincipal;
        this.director = director;
        this.tipoContenido = tipoContenido;
        this.descripcion = descripcion;
        this.fecha = fecha;
        this.imagenUrl = imagenUrl;
        this.nota = nota;
        this.nVotos = nVotos;
        this.trailerUrl = trailerUrl;
    }

    public Long getId() { return id; }
    public String getIdApi() { return idApi; }
    public Long getIdTmdb() { return idTmdb; }
    public String getTituloPrincipal() { return tituloPrincipal; }
    public String getDirector() { return director; }
    public TipoContenido getTipoContenido() { return tipoContenido; }
    public String getDescripcion() { return descripcion; }
    public LocalDate getFecha() { return fecha; }
    public String getImagenUrl() { return imagenUrl; }
    public Double getNota() { return nota; }
    public Integer getNVotos() { return nVotos; }
    public String getTrailerUrl() { return trailerUrl; }
}