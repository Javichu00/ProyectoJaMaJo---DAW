CREATE DATABASE IF NOT EXISTS JAMAJO_DDBB;
USE JAMAJO_DDBB;

CREATE TABLE IF NOT EXISTS Trabajadores (
    id_trabajador   BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_api      VARCHAR(20) UNIQUE NOT NULL,
    nombre          VARCHAR(150) NOT NULL,
    rutaFoto       TEXT
);

CREATE TABLE IF NOT EXISTS Categoria (
    nombreCategoria VARCHAR(100) PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Planes (
    nombrePlan VARCHAR(100) PRIMARY KEY,
    precio DECIMAL(5,2)
);

CREATE TABLE usuarios (
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('ADMIN', 'CLIENTE') NOT NULL DEFAULT 'CLIENTE',
    nombre_plan VARCHAR(50) NOT NULL DEFAULT 'GRATIS',
    enabled TINYINT(1) NOT NULL DEFAULT 1,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_fin DATE NULL,
    reset_token INT NULL,
    reset_token_expira DATETIME NULL,
    PRIMARY KEY (email),
    FOREIGN KEY (nombre_plan) REFERENCES planes(nombreplan)
);

CREATE TABLE IF NOT EXISTS Cuenta (
    id_cuenta       BIGINT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    username        VARCHAR(100) NOT NULL,
    id_foto         INT,
    FOREIGN KEY (email) REFERENCES Usuarios(email) ON DELETE CASCADE,
    UNIQUE (email, username)
);

CREATE TABLE IF NOT EXISTS Contenido (
    id_contenido        BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_api          	VARCHAR(20) UNIQUE NOT NULL,
    id_tmdb             BIGINT,
    titulo_principal    VARCHAR(255) NOT NULL,
    id_director         BIGINT,
    tipo_contenido      ENUM('PELICULA', 'SERIE') NOT NULL,
    descripcion         TEXT,
    fecha               DATE,
    imagen_url          TEXT,
    nota 				DECIMAL(3,1),
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
    nombre              VARCHAR(255),
    descripcion         TEXT,
    FOREIGN KEY (id_serie) REFERENCES Serie(id_serie) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Episodio (
    id_episodio     BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_temporada    BIGINT NOT NULL,
    numero_episodio INT NOT NULL,
    titulo          VARCHAR(255),
    descripcion     TEXT,
    duracion        INT NOT NULL,
    fecha_emision   DATE,
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
    id_cuenta   BIGINT NOT NULL,
    nombre      VARCHAR(150) NOT NULL,
    FOREIGN KEY (id_cuenta) REFERENCES Cuenta(id_cuenta) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ListaTieneContenido (
    id_ltc          BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_lista        BIGINT NOT NULL,
    id_contenido    BIGINT NOT NULL,
    FOREIGN KEY (id_lista) REFERENCES Lista(id_lista) ON DELETE CASCADE,
    FOREIGN KEY (id_contenido) REFERENCES Contenido(id_contenido) ON DELETE CASCADE,
    CONSTRAINT uq_ltc UNIQUE (id_lista, id_contenido)
);

CREATE TABLE IF NOT EXISTS Pagos (
    id_pago         BIGINT AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255) NOT NULL,
    nombrePlan      VARCHAR(100) NOT NULL,
    importe         DECIMAL(5,2) NOT NULL,
    fecha_pago      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email) REFERENCES Usuarios(email) ON DELETE CASCADE,
    FOREIGN KEY (nombrePlan) REFERENCES Planes(nombrePlan)
);

CREATE TABLE IF NOT EXISTS Resena (
    id_resena       BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_cuenta       BIGINT NOT NULL,
    id_contenido    BIGINT NOT NULL,
    texto           TEXT NOT NULL,
    puntuacion      TINYINT NOT NULL CHECK (puntuacion BETWEEN 1 AND 5),
    fecha_creacion  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cuenta) REFERENCES Cuenta(id_cuenta) ON DELETE CASCADE,
    FOREIGN KEY (id_contenido) REFERENCES Contenido(id_contenido) ON DELETE CASCADE,
    CONSTRAINT uq_resena UNIQUE (id_cuenta, id_contenido)
);

INSERT IGNORE INTO Planes (nombrePlan, precio) VALUES 
('GRATIS', 0.00),
('ANUNCIOS', 6.99),
('ESTANDAR', 12.99),
('PRO', 19.99);

INSERT IGNORE INTO Categoria (nombreCategoria) VALUES ('Acción'),('Animación'),('Aventura'),('Biografía'),('Ciencia Ficción'),
('Cine Negro'),('Comedia'),('Crimen'),('Deporte'),('Documental'),('Drama'),('Familia'),('Fantasía'),('Game-Show'),('Guerra'),('Historia'),
('Misterio'),('Música'),('Musical'),('News'),('Reality-TV'),('Romance'),('Short'),('Suspense'),('Talk-Show'),('Terror'),('Western');

INSERT IGNORE INTO Usuarios (email, password, tipo_usuario)
VALUES
('admin@gmail.com', 'Qwerty1', 'ADMIN'),
('cliente1@gmail.com', 'Qwerty1', 'CLIENTE'),
('cliente2@gmail.com', 'Qwerty1', 'CLIENTE');

INSERT IGNORE INTO Cuenta (email, username, id_foto)
VALUES
('admin@gmail.com', 'admin', 1),
('cliente1@gmail.com', 'cliente1', 1),
('cliente2@gmail.com', 'cliente2', 1);