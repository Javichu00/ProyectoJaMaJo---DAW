package com.jamajo.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import com.jamajo.backend.enums.TipoContenido;

@Entity
@Table(name = "Contenido")
@Inheritance(strategy = InheritanceType.JOINED)
public class Contenido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_contenido")
    private Long id;

    @Column(name = "id_api", unique = true, nullable = false, length = 20)
    private String idApi;

    @Column(name = "titulo_principal", nullable = false)
    private String tituloPrincipal;

    @ManyToOne
    @JoinColumn(name = "id_director")
    private Trabajador director;

    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_contenido", nullable = false)
    private TipoContenido tipoContenido;

    @Column(columnDefinition = "TEXT")
    private String descripcion;

    private LocalDate fecha;

    @Column(name = "imagen_url", columnDefinition = "TEXT")
    private String imagenUrl;

    private Integer nota;

    @Column(name = "n_votos")
    private Integer nVotos;

    @Column(name = "trailer_url", columnDefinition = "TEXT")
    private String trailerUrl;

    public Contenido() {}

    public Contenido(Long id, String idApi, String tituloPrincipal, Trabajador director,
                     TipoContenido tipoContenido, String descripcion, LocalDate fecha,
                     String imagenUrl, Integer nota, Integer nVotos, String trailerUrl) {
        this.id = id;
        this.idApi = idApi;
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
    public void setId(Long id) { this.id = id; }

    public String getIdApi() { return idApi; }
    public void setIdApi(String idApi) { this.idApi = idApi; }

    public String getTituloPrincipal() { return tituloPrincipal; }
    public void setTituloPrincipal(String tituloPrincipal) { this.tituloPrincipal = tituloPrincipal; }

    public Trabajador getDirector() { return director; }
    public void setDirector(Trabajador director) { this.director = director; }

    public TipoContenido getTipoContenido() { return tipoContenido; }
    public void setTipoContenido(TipoContenido tipoContenido) { this.tipoContenido = tipoContenido; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }

    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }

    public String getImagenUrl() { return imagenUrl; }
    public void setImagenUrl(String imagenUrl) { this.imagenUrl = imagenUrl; }

    public Integer getNota() { return nota; }
    public void setNota(Integer nota) { this.nota = nota; }

    public Integer getNVotos() { return nVotos; }
    public void setNVotos(Integer nVotos) { this.nVotos = nVotos; }

    public String getTrailerUrl() { return trailerUrl; }
    public void setTrailerUrl(String trailerUrl) { this.trailerUrl = trailerUrl; }
}