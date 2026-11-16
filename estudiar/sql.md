# SQL - Guia tecnica facil

La base de datos guarda toda la informacion importante de JAM:

- Usuarios.
- Perfiles/cuentas.
- Planes y pagos.
- Peliculas y series.
- Categorias.
- Directores y actores.
- Episodios.
- Listas.
- Resenas.

La idea no es memorizar todas las columnas, sino entender que guarda cada tabla y como se relaciona con las demas.

## 1. Base de datos

Nombre:

```text
JAMAJO_DDBB
```

Script principal:

```text
SQL/ConstructoresFuncionales/ConstructorDeTablas.sql
```

Ese script crea:

- La base de datos.
- Las tablas.
- Las claves primarias.
- Las claves externas.
- Algunos datos iniciales como planes, categorias y usuarios de prueba.

## 2. Scripts importantes

```text
ConstructorDeTablas.sql
```

Crea la estructura principal.

```text
Populate_IMDB.sql
```

Mete datos de IMDb: contenidos, trabajadores, reparto, categorias, duracion, etc.

```text
Populate_TMDB.sql
```

Completa datos de TMDB: imagenes, trailer, descripcion, temporadas y episodios.

```text
AltersIdSerie.sql
```

Ajusta relaciones de series/temporadas y agrega algun campo extra necesario.

```text
indices.sql
```

Crea indices para que algunas consultas vayan mas rapido.

Orden logico:

```text
1. ConstructorDeTablas.sql
2. Populate_IMDB.sql
3. Populate_TMDB.sql
4. AltersIdSerie.sql
5. indices.sql
```

## 3. Cuantas tablas hay

El modelo principal tiene 16 tablas:

```text
Trabajadores
Categoria
Planes
Usuarios
Cuenta
Contenido
Pelicula
Serie
Temporada
Episodio
ActorParticipa
ContenidoPerteneceACategoria
Lista
ListaTieneContenido
Pagos
Resena
```

Para entenderlas mejor, se pueden dividir en grupos.

## 4. Grupo usuarios y planes

Estas tablas explican quien usa la plataforma y que plan tiene.

```text
Usuarios
Cuenta
Planes
Pagos
```

## 5. Tabla `Usuarios`

Guarda el usuario principal.

Clave primaria:

```text
email
```

Campos importantes:

```text
email
password
tipo_usuario
nombre_plan
enabled
fecha_registro
fecha_fin
reset_token
reset_token_expira
```

Que significa:

- `email`: identifica al usuario.
- `password`: contrasena.
- `tipo_usuario`: puede ser `ADMIN` o `CLIENTE`.
- `nombre_plan`: plan activo del usuario.
- `enabled`: indica si el usuario esta activo.
- `fecha_fin`: cuando termina el plan.
- `reset_token`: codigo para recuperar contrasena.

Relacion:

```text
Usuarios.nombre_plan -> Planes.nombrePlan
```

En sencillo:

```text
Cada usuario tiene un plan.
```

## 6. Tabla `Cuenta`

Guarda perfiles dentro de un usuario.

Clave primaria:

```text
id_cuenta
```

Campos importantes:

```text
id_cuenta
email
username
id_foto
```

Relacion:

```text
Cuenta.email -> Usuarios.email
```

En sencillo:

```text
Un usuario puede tener varios perfiles/cuentas.
```

Ejemplo:

```text
usuario: familia@gmail.com
  -> perfil Jorge
  -> perfil Maria
  -> perfil Invitado
```

Restriccion:

```text
UNIQUE(email, username)
```

Esto evita que el mismo usuario tenga dos perfiles con el mismo nombre.

## 7. Tabla `Planes`

Guarda los planes disponibles.

Clave primaria:

```text
nombrePlan
```

Campos:

```text
nombrePlan
precio
```

Ejemplos:

```text
GRATIS
ANUNCIOS
ESTANDAR
PRO
```

En sencillo:

```text
Planes es una tabla pequena con los tipos de suscripcion.
```

## 8. Tabla `Pagos`

Guarda pagos realizados por usuarios.

Clave primaria:

```text
id_pago
```

Campos importantes:

```text
id_pago
email
nombrePlan
importe
fecha_pago
```

Relaciones:

```text
Pagos.email -> Usuarios.email
Pagos.nombrePlan -> Planes.nombrePlan
```

En sencillo:

```text
Un pago pertenece a un usuario y corresponde a un plan.
```

Cuando se registra un pago, el backend tambien puede actualizar el plan activo del usuario.

## 9. Grupo catalogo

Estas tablas guardan peliculas, series, temporadas y episodios.

```text
Contenido
Pelicula
Serie
Temporada
Episodio
```

## 10. Tabla `Contenido`

Es la tabla central del catalogo.

Clave primaria:

```text
id_contenido
```

Campos importantes:

```text
id_contenido
id_api
id_tmdb
titulo_principal
id_director
tipo_contenido
descripcion
fecha
imagen_url
nota
n_votos
trailer_url
```

En sencillo:

```text
Contenido guarda lo comun de peliculas y series.
```

Por eso tiene:

- Titulo.
- Imagen.
- Nota.
- Fecha.
- Trailer.
- Director.
- Tipo.

El campo clave es:

```text
tipo_contenido
```

Puede ser:

```text
PELICULA
SERIE
```

Relacion:

```text
Contenido.id_director -> Trabajadores.id_trabajador
```

En sencillo:

```text
Cada contenido puede tener un director.
```

## 11. Tabla `Pelicula`

Guarda lo especifico de una pelicula.

Clave primaria:

```text
id_contenido
```

Campos:

```text
id_contenido
duracion
```

Relacion:

```text
Pelicula.id_contenido -> Contenido.id_contenido
```

En sencillo:

```text
Una pelicula es un contenido que ademas tiene duracion.
```

Ejemplo:

```text
Contenido
  id_contenido = 10
  titulo = Interstellar
  tipo = PELICULA

Pelicula
  id_contenido = 10
  duracion = 169
```

## 12. Tabla `Serie`

Guarda lo especifico de una serie.

Clave primaria:

```text
id_serie
```

Campo importante:

```text
id_contenido
```

Relacion:

```text
Serie.id_contenido -> Contenido.id_contenido
```

En sencillo:

```text
Una serie es un contenido que despues puede tener temporadas.
```

## 13. Tabla `Temporada`

Guarda temporadas de una serie.

Clave primaria:

```text
id_temporada
```

Campos importantes:

```text
id_serie
numero_temporada
nombre
descripcion
```

Relacion:

```text
Temporada.id_serie -> Serie.id_serie
```

En sencillo:

```text
Una serie puede tener muchas temporadas.
```

## 14. Tabla `Episodio`

Guarda episodios dentro de una temporada.

Clave primaria:

```text
id_episodio
```

Campos importantes:

```text
id_temporada
numero_episodio
titulo
descripcion
duracion
fecha_emision
```

Relacion:

```text
Episodio.id_temporada -> Temporada.id_temporada
```

En sencillo:

```text
Una temporada puede tener muchos episodios.
```

Cadena completa:

```text
Contenido
  -> Serie
    -> Temporada
      -> Episodio
```

## 15. Grupo trabajadores y categorias

Estas tablas explican quien participa en un contenido y a que categorias pertenece.

```text
Trabajadores
ActorParticipa
Categoria
ContenidoPerteneceACategoria
```

## 16. Tabla `Trabajadores`

Guarda personas del catalogo.

Clave primaria:

```text
id_trabajador
```

Campos importantes:

```text
id_trabajador
id_api
nombre
rutaFoto
```

En sencillo:

```text
Trabajadores guarda actores y directores.
```

Un trabajador puede aparecer de dos formas:

```text
Como director -> Contenido.id_director
Como actor    -> ActorParticipa
```

## 17. Tabla `ActorParticipa`

Une contenidos con trabajadores que actuan.

Clave primaria:

```text
id_relacion
```

Campos:

```text
id_contenido
id_trabajador
```

Relaciones:

```text
ActorParticipa.id_contenido -> Contenido.id_contenido
ActorParticipa.id_trabajador -> Trabajadores.id_trabajador
```

En sencillo:

```text
Esta tabla dice que actor participa en que pelicula o serie.
```

Es una relacion muchos a muchos:

```text
Un contenido tiene muchos actores.
Un actor participa en muchos contenidos.
```

Restriccion:

```text
UNIQUE(id_contenido, id_trabajador)
```

Evita repetir el mismo actor dos veces en el mismo contenido.

## 18. Tabla `Categoria`

Guarda los generos/categorias.

Clave primaria:

```text
nombreCategoria
```

Ejemplos:

```text
Accion
Drama
Comedia
Terror
```

En sencillo:

```text
Categoria es una lista de nombres de generos.
```

## 19. Tabla `ContenidoPerteneceACategoria`

Une contenidos con categorias.

Clave primaria:

```text
id_relacion
```

Campos:

```text
id_contenido
nombreCategoria
```

Relaciones:

```text
ContenidoPerteneceACategoria.id_contenido -> Contenido.id_contenido
ContenidoPerteneceACategoria.nombreCategoria -> Categoria.nombreCategoria
```

En sencillo:

```text
Esta tabla dice a que categorias pertenece cada pelicula o serie.
```

Es una relacion muchos a muchos:

```text
Un contenido puede tener muchas categorias.
Una categoria puede tener muchos contenidos.
```

Restriccion:

```text
UNIQUE(id_contenido, nombreCategoria)
```

Evita repetir la misma categoria en el mismo contenido.

## 20. Grupo interaccion del usuario

Estas tablas guardan lo que hace el usuario dentro de la pagina.

```text
Lista
ListaTieneContenido
Resena
```

## 21. Tabla `Lista`

Guarda listas creadas por un perfil/cuenta.

Clave primaria:

```text
id_lista
```

Campos:

```text
id_lista
id_cuenta
nombre
```

Relacion:

```text
Lista.id_cuenta -> Cuenta.id_cuenta
```

En sencillo:

```text
Una cuenta puede crear varias listas.
```

## 22. Tabla `ListaTieneContenido`

Une listas con contenidos.

Clave primaria:

```text
id_ltc
```

Campos:

```text
id_lista
id_contenido
```

Relaciones:

```text
ListaTieneContenido.id_lista -> Lista.id_lista
ListaTieneContenido.id_contenido -> Contenido.id_contenido
```

En sencillo:

```text
Esta tabla dice que peliculas o series hay dentro de cada lista.
```

Es una relacion muchos a muchos:

```text
Una lista tiene muchos contenidos.
Un contenido puede estar en muchas listas.
```

Restriccion:

```text
UNIQUE(id_lista, id_contenido)
```

Evita meter dos veces el mismo contenido en la misma lista.

## 23. Tabla `Resena`

Guarda opiniones de usuarios sobre contenidos.

Clave primaria:

```text
id_resena
```

Campos importantes:

```text
id_cuenta
id_contenido
texto
puntuacion
fecha_creacion
```

Relaciones:

```text
Resena.id_cuenta -> Cuenta.id_cuenta
Resena.id_contenido -> Contenido.id_contenido
```

En sencillo:

```text
Una resena pertenece a una cuenta y a una pelicula/serie.
```

Regla:

```text
puntuacion entre 1 y 5
```

Restriccion:

```text
UNIQUE(id_cuenta, id_contenido)
```

Esto significa:

```text
Una cuenta solo puede escribir una resena por contenido.
```

## 24. Relaciones mas importantes resumidas

```text
Usuarios 1 -> muchas Cuenta
Planes 1 -> muchos Usuarios
Usuarios 1 -> muchos Pagos

Contenido 1 -> 0/1 Pelicula
Contenido 1 -> 0/1 Serie
Serie 1 -> muchas Temporada
Temporada 1 -> muchos Episodio

Trabajadores 1 -> muchos Contenido como director
Trabajadores muchos <-> muchos Contenido como actor mediante ActorParticipa

Contenido muchos <-> muchas Categoria mediante ContenidoPerteneceACategoria

Cuenta 1 -> muchas Lista
Lista muchos <-> muchos Contenido mediante ListaTieneContenido

Cuenta 1 -> muchas Resena
Contenido 1 -> muchas Resena
```

## 25. Que significa `ON DELETE CASCADE`

Ejemplo:

```sql
FOREIGN KEY (id_cuenta) REFERENCES Cuenta(id_cuenta) ON DELETE CASCADE
```

Significa:

```text
Si se borra la cuenta, se borran automaticamente sus datos relacionados.
```

Ejemplo:

```text
Cuenta se borra
  -> se borran sus listas
  -> se borran sus resenas
```

Esto evita datos sueltos sin padre.

## 26. Que significa `ON DELETE SET NULL`

Ejemplo:

```text
Contenido.id_director -> Trabajadores.id_trabajador ON DELETE SET NULL
```

Significa:

```text
Si se borra el trabajador/director, el contenido no se borra.
Solo se deja el director como null.
```

Tiene sentido porque una pelicula puede seguir existiendo aunque falte el dato del director.

## 27. Que son los indices

Los indices ayudan a buscar mas rapido.

Ejemplos de campos que conviene indexar:

- Director.
- Categoria.
- Nota.
- Numero de votos.
- Relaciones entre contenido y categoria.

En sencillo:

```text
Un indice es como el indice de un libro.
No cambia los datos, pero ayuda a encontrarlos antes.
```

## 28. Ejemplo completo: abrir una pelicula

Supongamos que abres:

```text
pelicula.html?id=10
```

La base de datos se usa asi:

```text
Contenido
  -> datos generales de la pelicula

Pelicula
  -> duracion

Trabajadores
  -> director

ActorParticipa + Trabajadores
  -> actores

ContenidoPerteneceACategoria + Categoria
  -> categorias

Resena
  -> opiniones

ListaTieneContenido
  -> si el usuario la guarda en una lista
```

## 29. Ejemplo completo: abrir una serie

Supongamos que abres:

```text
serie.html?id=20
```

La base de datos se usa asi:

```text
Contenido
  -> datos generales de la serie

Serie
  -> relacion con temporadas

Temporada
  -> temporadas de la serie

Episodio
  -> episodios de cada temporada

ActorParticipa + Trabajadores
  -> actores

ContenidoPerteneceACategoria + Categoria
  -> categorias

Resena
  -> opiniones
```

## 30. Como explicar SQL sin liarte

Puedes decir:

> La base de datos esta organizada por bloques. `Contenido` es la tabla central del catalogo, y desde ahi se relacionan peliculas, series, categorias, trabajadores, resenas y listas. Los usuarios tienen cuentas/perfiles, y esos perfiles son los que guardan listas y escriben resenas.

Otra frase util:

> Las tablas intermedias sirven para relaciones muchos a muchos. Por ejemplo, un actor puede participar en muchas peliculas, y una pelicula tiene muchos actores; por eso existe `ActorParticipa`.

## 31. Resumen final

La base se entiende asi:

```text
Usuarios pagan planes
Usuarios tienen cuentas/perfiles
Cuentas crean listas y resenas
Contenido guarda peliculas y series
Peliculas y series amplian contenido
Series tienen temporadas y episodios
Trabajadores se relacionan con contenido
Categorias clasifican contenido
Listas guardan contenido
Resenas opinan sobre contenido
```

Si entiendes esas relaciones, entiendes la base de datos del proyecto.
