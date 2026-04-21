CREATE DATABASE IF NOT EXISTS JAMAJO_DDBB;
USE JAMAJO_DDBB;

CREATE TABLE IF NOT EXISTS Trabajadores (
    id_trabajador   BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_api      VARCHAR(20) UNIQUE NOT NULL,
    nombre          VARCHAR(150) NOT NULL,
    biografia       TEXT
);

CREATE TABLE IF NOT EXISTS Categoria (
    nombreCategoria VARCHAR(100) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Perfil (
    id_perfil   VARCHAR(50) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Usuarios (
    email           VARCHAR(255) PRIMARY KEY,
    username        VARCHAR(100) NOT NULL,
    password        VARCHAR(64)  NOT NULL,
    fecha_registro  DATE NOT NULL DEFAULT (CURRENT_DATE),
    id_perfil       VARCHAR(50) NOT NULL DEFAULT 'CLIENTE',
    enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    FOREIGN KEY (id_perfil) REFERENCES Perfil(id_perfil)
);

CREATE TABLE IF NOT EXISTS Contenido (
    id_contenido        BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_api          	VARCHAR(20) UNIQUE NOT NULL,
    titulo_principal    VARCHAR(255) NOT NULL,
    id_director         BIGINT,
    tipo_contenido      ENUM('PELICULA', 'SERIE') NOT NULL,
    descripcion         TEXT,
    fecha               DATE,
    imagen_url          TEXT,
    nota 				INT,
    n_votos				INT,
    trailer_url			TEXT,

    FOREIGN KEY (id_director) REFERENCES Trabajadores(id_trabajador) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS Pelicula (
    id_contenido    BIGINT PRIMARY KEY,
    duracion        INT NOT NULL,
    FOREIGN KEY (id_contenido) REFERENCES Contenido(id_contenido) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Serie (
    id_serie        BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_contenido    BIGINT NOT NULL UNIQUE,
    
    FOREIGN KEY (id_contenido) REFERENCES Contenido(id_contenido) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Temporada (
    id_temporada        BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_serie            BIGINT NOT NULL,
    numero_temporada    INT NOT NULL,
    
    FOREIGN KEY (id_serie) REFERENCES Serie(id_serie) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Episodio (
    id_episodio     BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_temporada    BIGINT NOT NULL,
    duracion        INT NOT NULL,
    
    FOREIGN KEY (id_temporada) REFERENCES Temporada(id_temporada) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ActorParticipa (
    id_relacion     BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_contenido    BIGINT NOT NULL,
    id_trabajador   BIGINT NOT NULL,

    FOREIGN KEY (id_contenido) REFERENCES Contenido(id_contenido) ON DELETE CASCADE,

    FOREIGN KEY (id_trabajador) REFERENCES Trabajadores(id_trabajador) ON DELETE CASCADE,

    CONSTRAINT uq_ap UNIQUE (id_contenido, id_trabajador)

);

CREATE TABLE IF NOT EXISTS ContenidoPerteneceACategoria (
    id_relacion     BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_contenido    BIGINT NOT NULL,
    nombreCategoria VARCHAR(100) NOT NULL,

    FOREIGN KEY (id_contenido) REFERENCES Contenido(id_contenido) ON DELETE CASCADE,

    FOREIGN KEY (nombreCategoria) REFERENCES Categoria(nombreCategoria) ON DELETE CASCADE,

    CONSTRAINT uq_cpc UNIQUE (id_contenido, nombreCategoria)
);

CREATE TABLE IF NOT EXISTS Lista (
    id_lista    BIGINT AUTO_INCREMENT PRIMARY KEY,
    email       VARCHAR(255) NOT NULL,
    nombre      VARCHAR(150) NOT NULL,

    FOREIGN KEY (email) REFERENCES Usuarios(email) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ListaTieneContenido (
    id_ltc          BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_lista        BIGINT NOT NULL,
    id_contenido    BIGINT NOT NULL,

    FOREIGN KEY (id_lista) REFERENCES Lista(id_lista) ON DELETE CASCADE,

    FOREIGN KEY (id_contenido) REFERENCES Contenido(id_contenido) ON DELETE CASCADE,

    CONSTRAINT uq_ltc UNIQUE (id_lista, id_contenido)
);

CREATE TABLE IF NOT EXISTS Resena (
    id_comentario       BIGINT AUTO_INCREMENT PRIMARY KEY,
    email               VARCHAR(255) NOT NULL,
    id_contenido        BIGINT NOT NULL,
    texto               TEXT NOT NULL,
    fecha_publicacion   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cant_estrellas DECIMAL(3,2) NOT NULL CHECK (cant_estrellas BETWEEN 0 AND 10),

    FOREIGN KEY (email) REFERENCES Usuarios(email) ON DELETE CASCADE,

    FOREIGN KEY (id_contenido) REFERENCES Contenido(id_contenido) ON DELETE CASCADE,

    CONSTRAINT uq_resena UNIQUE (email, id_contenido)
);