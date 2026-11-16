CREATE INDEX idx_contenido_director ON Contenido(id_director);
CREATE INDEX idx_contenido_votos ON Contenido(n_votos DESC);
CREATE INDEX idx_contenido_nota ON Contenido(nota DESC);
CREATE INDEX idx_cpac_categoria ON ContenidoPerteneceACategoria(nombreCategoria);
CREATE INDEX idx_cpac_contenido ON ContenidoPerteneceACategoria(id_contenido);