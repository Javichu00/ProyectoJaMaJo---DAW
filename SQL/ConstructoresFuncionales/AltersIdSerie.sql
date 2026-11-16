-- 1. Añadir nueva columna
ALTER TABLE Temporada ADD COLUMN id_contenido_serie BIGINT NOT NULL DEFAULT 0;

-- 2. Rellenar con el id_contenido correcto
UPDATE Temporada t
JOIN Serie s ON t.id_serie = s.id_serie
SET t.id_contenido_serie = s.id_contenido;

-- 3. Borrar FK y columna vieja
ALTER TABLE Temporada DROP FOREIGN KEY temporada_ibfk_1;
ALTER TABLE Temporada DROP COLUMN id_serie;

-- 4. Renombrar la nueva columna
ALTER TABLE Temporada RENAME COLUMN id_contenido_serie TO id_serie;

-- 5. Añadir nueva FK apuntando a Contenido
ALTER TABLE Temporada ADD CONSTRAINT fk_temporada_contenido 
    FOREIGN KEY (id_serie) REFERENCES Contenido(id_contenido) ON DELETE CASCADE;


ALTER TABLE actorparticipa ADD COLUMN rol_en_contenido VARCHAR(255);
