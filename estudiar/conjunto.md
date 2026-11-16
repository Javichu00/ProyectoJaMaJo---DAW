# Funcionamiento conjunto - Front + Back + SQL

Este documento explica como trabajan juntas las tres partes del proyecto:

```text
Frontend -> Backend -> SQL
```

La idea es que puedas entender cualquier accion de la pagina siguiendo el camino completo.

## 1. Mapa general

```text
Usuario usa la web
  -> Frontend detecta la accion
  -> Frontend llama al backend con fetch
  -> Backend recibe la peticion en un controller
  -> Backend usa un service para aplicar logica
  -> Backend usa un repository para consultar SQL
  -> SQL devuelve datos
  -> Backend prepara JSON
  -> Frontend pinta el resultado
```

Frase simple:

> El front muestra y pide datos, el back procesa y responde, y SQL guarda la informacion.

## 2. Que hace cada capa

## Frontend

Esta en:

```text
Front/codigo
```

Se encarga de:

- Mostrar pantallas.
- Leer clicks, formularios y buscadores.
- Guardar sesion en el navegador.
- Llamar al backend.
- Pintar los datos recibidos.

Ejemplo:

```text
El usuario escribe en el buscador de peliculas.
El frontend captura el texto y llama al backend.
```

## Backend

Esta en:

```text
Back/ProyectoSpring_BackendJaMaJo
```

Se encarga de:

- Recibir peticiones.
- Validar o interpretar parametros.
- Aplicar logica.
- Consultar la base de datos.
- Devolver JSON.

Ejemplo:

```text
El backend recibe "buscar peliculas con este texto"
y devuelve las coincidencias.
```

## SQL

Esta en:

```text
SQL/ConstructoresFuncionales
```

Se encarga de:

- Guardar usuarios.
- Guardar peliculas y series.
- Guardar categorias.
- Guardar trabajadores.
- Guardar listas.
- Guardar resenas.
- Relacionar tablas entre si.

Ejemplo:

```text
La tabla Contenido guarda peliculas y series.
La tabla Categoria guarda generos.
La tabla ContenidoPerteneceACategoria las relaciona.
```

## 3. Conexion entre frontend y backend

El frontend usa:

```text
API_BASE
```

Definido en:

```text
Front/codigo/js/api_IP.js
```

Ejemplo:

```js
const API_BASE = 'http://192.168.1.222:8080/api'
```

Si el frontend llama:

```js
fetch(`${API_BASE}/contenidos/buscar?tipo=PELICULA`)
```

Realmente esta llamando a:

```text
http://192.168.1.222:8080/api/contenidos/buscar?tipo=PELICULA
```

Eso llega al backend.

## 4. Conexion entre backend y SQL

El backend se conecta a MySQL con:

```text
application.properties
```

Ejemplo:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/JAMAJO_DDBB
```

Esto significa:

```text
El backend usa la base de datos JAMAJO_DDBB.
```

Los repositories son los que hacen las consultas.

Ejemplo:

```text
ContenidoRepository consulta la tabla Contenido.
UsuarioRepository consulta la tabla Usuarios.
ResenaRepository consulta la tabla Resena.
```

## 5. Patron que se repite en todo el proyecto

Casi todas las funciones siguen este patron:

```text
HTML tiene un contenedor
JS pide datos
Controller recibe endpoint
Service decide que hacer
Repository consulta SQL
SQL devuelve datos
Service prepara respuesta
Controller devuelve JSON
JS pinta HTML
```

Si entiendes esto, puedes explicar casi cualquier parte.

## 6. Flujo: login

Pantalla:

```text
landing.html
```

Frontend:

```text
landing.js
```

Flujo:

```text
Usuario escribe email y password
  -> landing.js llama al backend
  -> backend comprueba usuario y password
  -> SQL busca en Usuarios
  -> backend responde si es valido
  -> frontend guarda JAM_user en localStorage
  -> usuario pasa a elegir perfil
```

Tablas usadas:

```text
Usuarios
Cuenta
```

Endpoints principales:

```text
GET /api/usuarios/{email}
GET /api/usuarios/{email}/{password}
GET /api/cuentas/{email}
```

Idea clave:

```text
Primero se identifica el usuario.
Despues se elige el perfil/cuenta.
```

## 7. Flujo: elegir perfil

Pantalla:

```text
perfiles.html
```

Frontend:

```text
perfiles.js
```

Flujo:

```text
Frontend lee JAM_user
  -> pide cuentas del usuario
  -> backend busca cuentas por email
  -> SQL consulta Cuenta
  -> usuario elige una cuenta
  -> frontend guarda JAM_profile
```

Tabla usada:

```text
Cuenta
```

Idea clave:

```text
El usuario es quien paga.
La cuenta/perfil es quien navega, guarda listas y hace resenas.
```

## 8. Flujo: peliculas

Pantalla:

```text
peliculas.html
```

Frontend:

```text
peliculas.js
catalog-discovery.js
```

Flujo:

```text
Usuario entra en peliculas
  -> JS configura tipo PELICULA
  -> frontend llama a /api/contenidos/buscar?tipo=PELICULA
  -> backend busca contenido de tipo PELICULA
  -> SQL consulta Contenido y Pelicula
  -> backend devuelve JSON
  -> frontend pinta cards
```

Tablas usadas:

```text
Contenido
Pelicula
Trabajadores
ContenidoPerteneceACategoria
Categoria
```

Idea clave:

```text
La pagina no tiene las peliculas escritas.
Las pide al backend y las pinta dinamicamente.
```

## 9. Flujo: series

Pantalla:

```text
series.html
```

Frontend:

```text
series.js
catalog-discovery.js
```

Flujo:

```text
Usuario entra en series
  -> JS configura tipo SERIE
  -> frontend llama a /api/contenidos/buscar?tipo=SERIE
  -> backend busca contenido de tipo SERIE
  -> SQL consulta Contenido y Serie
  -> backend devuelve JSON
  -> frontend pinta cards
```

Tablas usadas:

```text
Contenido
Serie
Trabajadores
ContenidoPerteneceACategoria
Categoria
```

Idea clave:

```text
Peliculas y series comparten la misma base: Contenido.
Lo que cambia es el tipo.
```

## 10. Flujo: explorar

Pantalla:

```text
explorar.html
```

Frontend:

```text
explorar.js
```

Flujo:

```text
Usuario escribe en explorar
  -> frontend busca contenido
  -> frontend busca trabajadores
  -> backend consulta contenido y trabajadores
  -> SQL devuelve coincidencias
  -> frontend mezcla resultados
  -> se pintan cards de peliculas, series y trabajadores
```

Endpoints:

```text
GET /api/contenidos/buscar
GET /api/trabajadores/buscar
```

Tablas usadas:

```text
Contenido
Pelicula
Serie
Trabajadores
ActorParticipa
```

Idea clave:

```text
Explorar es una busqueda general.
No solo busca contenido, tambien personas.
```

## 11. Flujo: categorias

Pantalla:

```text
categoria.html
```

Frontend:

```text
categoria.js
```

Flujo:

```text
Usuario pulsa una categoria
  -> frontend abre categoria.html?categoria=...
  -> categoria.js lee el nombre de la categoria
  -> llama a /api/contenidos/categoria/{nombreCategoria}
  -> backend busca contenidos de esa categoria
  -> SQL usa la tabla intermedia ContenidoPerteneceACategoria
  -> backend devuelve lista de contenidos
  -> frontend pinta cards
```

Tablas usadas:

```text
Categoria
ContenidoPerteneceACategoria
Contenido
Pelicula
Serie
```

Idea clave:

```text
Una categoria no contiene los datos completos.
Solo se relaciona con contenidos mediante una tabla intermedia.
```

## 12. Flujo: entrar en una pelicula desde categoria

Este es el recorrido importante para tu presentacion.

Flujo:

```text
Usuario esta en una categoria
  -> pulsa una card de pelicula
  -> frontend abre pelicula.html?id=...
  -> pelicula.js lee el id
  -> pide /api/contenidos/{id}
  -> backend busca datos completos
  -> SQL consulta varias tablas
  -> frontend pinta el detalle
```

Tablas principales:

```text
Contenido
Pelicula
Trabajadores
ActorParticipa
Categoria
ContenidoPerteneceACategoria
Resena
Lista
ListaTieneContenido
```

Idea clave:

```text
El detalle de pelicula junta varias partes del sistema.
```

## 13. Flujo: detalle de pelicula

Pantalla:

```text
pelicula.html
```

Frontend:

```text
pelicula.js
resena.js
listas-widget.js
trabajador-links.js
```

Flujo general:

```text
pelicula.js carga datos principales
  -> resena.js carga opiniones
  -> listas-widget.js permite guardar
  -> trabajador-links.js permite ir a actores/directores
```

Endpoints habituales:

```text
GET /api/contenidos/{id}
GET /api/contenidos/{id}/actores
GET /api/contenidos/{id}/recomendados
GET /api/resenas/contenido/{idContenido}
GET /api/resenas/contenido/{idContenido}/media
GET /api/listas/cuenta/{idCuenta}
```

Idea clave:

```text
La pantalla de pelicula no viene de un solo sitio.
Va pidiendo distintas piezas al backend.
```

## 14. Flujo: ver pelicula y anuncio

Parte del detalle:

```text
Boton Ver en JAM
```

Flujo conceptual:

```text
Usuario pulsa ver
  -> frontend controla el paso de visualizacion
  -> si corresponde, se muestra anuncio
  -> despues se permite ver el contenido
```

Esto es sobre todo logica de frontend.

El backend no necesita guardar mucho para mostrar el anuncio, salvo que se quiera registrar historial o reproducciones.

Idea clave:

```text
El anuncio forma parte del flujo de experiencia del usuario antes de reproducir.
```

## 15. Flujo: guardar en lista

Parte del detalle:

```text
Guardar / Anadir a lista
```

Flujo:

```text
Usuario pulsa guardar
  -> frontend lee JAM_profile
  -> obtiene idCuenta
  -> pide listas de esa cuenta
  -> usuario elige lista
  -> frontend manda idLista + idContenido
  -> backend guarda relacion
  -> SQL inserta en ListaTieneContenido
```

Endpoints:

```text
GET /api/listas/cuenta/{idCuenta}
POST /api/listas/{idLista}/contenidos/{idContenido}
DELETE /api/listas/{idLista}/contenidos/{idContenido}
```

Tablas:

```text
Cuenta
Lista
ListaTieneContenido
Contenido
```

Idea clave:

```text
Guardar una pelicula no duplica la pelicula.
Solo crea una relacion entre lista y contenido.
```

## 16. Flujo: resenas

Parte del detalle:

```text
Resenas
```

Flujo para ver:

```text
Frontend pide resenas del contenido
  -> backend busca por idContenido
  -> SQL consulta Resena
  -> frontend pinta opiniones
```

Flujo para crear:

```text
Usuario escribe resena
  -> frontend manda idCuenta, idContenido, texto y puntuacion
  -> backend valida
  -> SQL guarda Resena
  -> frontend actualiza la lista
```

Endpoints:

```text
GET /api/resenas/contenido/{idContenido}
GET /api/resenas/contenido/{idContenido}/media
POST /api/resenas
PUT /api/resenas/{idResena}
DELETE /api/resenas/{idResena}
```

Tablas:

```text
Resena
Cuenta
Contenido
```

Idea clave:

```text
Una resena siempre pertenece a una cuenta y a un contenido.
```

## 17. Flujo: trabajadores desde una pelicula

Parte del detalle:

```text
Director y actores
```

Flujo:

```text
pelicula.js muestra trabajadores relacionados
  -> trabajador-links.js los hace clicables
  -> usuario pulsa un trabajador
  -> abre trabajador.html?id=...
  -> trabajador.js pide datos del trabajador
  -> trabajador.js pide filmografia
  -> backend consulta relaciones
  -> frontend pinta perfil y contenidos
```

Endpoints:

```text
GET /api/trabajadores/{id}
GET /api/trabajadores/{id}/filmografia
```

Tablas:

```text
Trabajadores
Contenido
ActorParticipa
```

Idea clave:

```text
La filmografia se obtiene mirando en que contenidos aparece ese trabajador.
```

## 18. Flujo: detalle de serie

Pantalla:

```text
serie.html
```

Frontend:

```text
serie.js
resena.js
listas-widget.js
trabajador-links.js
```

Flujo:

```text
serie.js lee id de la URL
  -> pide datos generales a /api/contenidos/{id}
  -> pide episodios a /api/episodios/serie/{id}
  -> backend busca serie, temporadas y episodios
  -> frontend pinta selector de temporada/episodio
```

Tablas:

```text
Contenido
Serie
Temporada
Episodio
Trabajadores
ActorParticipa
Resena
Lista
```

Idea clave:

```text
La serie comparte mucho con pelicula, pero ademas tiene temporadas y episodios.
```

## 19. Flujo: planes y pagos

Pantallas:

```text
planes.html
pago.html
cuenta.html
```

Frontend:

```text
planes.js
pago.js
cuenta.js
```

Flujo:

```text
Usuario elige plan
  -> frontend guarda planSeleccionado
  -> usuario va a pago
  -> pago.js manda el pago al backend
  -> backend crea registro en Pagos
  -> backend actualiza Usuarios.nombre_plan
  -> frontend refresca JAM_user
```

Endpoints:

```text
GET /api/planes
POST /api/pagos/{email}
GET /api/pagos/{email}
POST /api/usuarios/{email}/confirmar-pago
```

Tablas:

```text
Planes
Pagos
Usuarios
```

Idea clave:

```text
Pagar no solo crea un pago.
Tambien cambia el plan activo del usuario.
```

## 20. Flujo: cuenta de usuario

Pantalla:

```text
cuenta.html
```

Frontend:

```text
cuenta.js
```

Flujo:

```text
Frontend lee JAM_user
  -> pide datos del usuario
  -> pide pagos
  -> pide cuentas/perfiles
  -> pinta panel de cuenta
```

Tambien puede:

- Crear perfil.
- Editar perfil.
- Borrar perfil.
- Cambiar contrasena.
- Desactivar usuario.

Tablas:

```text
Usuarios
Cuenta
Pagos
Planes
```

## 21. Flujo: dashboard admin

Pantalla:

```text
dashboard.html
```

Frontend:

```text
dashboard-script.js
```

Flujo:

```text
Admin entra al dashboard
  -> frontend comprueba usuario/admin
  -> pide usuarios, planes, pagos o cuentas
  -> backend consulta SQL
  -> frontend pinta paneles de gestion
```

Tablas usadas:

```text
Usuarios
Cuenta
Planes
Pagos
```

Idea clave:

```text
El dashboard usa muchos endpoints ya existentes, pero con una vista administrativa.
```

## 22. Ejemplo tecnico completo: buscar pelicula

Accion:

```text
Usuario escribe "Matrix" en peliculas
```

Recorrido:

```text
1. catalog-discovery.js detecta el texto.
2. Hace fetch a /api/contenidos/buscar?q=Matrix&tipo=PELICULA.
3. ContenidoController recibe q y tipo.
4. ContenidoService prepara la busqueda.
5. ContenidoRepository consulta Contenido filtrando por titulo y tipo.
6. SQL devuelve coincidencias.
7. Backend convierte datos a DTO/JSON.
8. Frontend recibe la lista.
9. Frontend crea cards.
```

Tablas:

```text
Contenido
Pelicula
Trabajadores
Categoria
```

## 23. Ejemplo tecnico completo: abrir trabajador

Accion:

```text
Usuario pulsa Steven Spielberg
```

Recorrido:

```text
1. trabajador-links.js abre trabajador.html?id=...
2. trabajador.js lee el id.
3. Pide /api/trabajadores/{id}.
4. Pide /api/trabajadores/{id}/filmografia.
5. TrabajadorController recibe ambas peticiones.
6. TrabajadorService busca trabajador y contenidos.
7. Repository consulta Trabajadores, Contenido y ActorParticipa.
8. Backend devuelve JSON.
9. Frontend pinta perfil y filmografia.
```

Tablas:

```text
Trabajadores
Contenido
ActorParticipa
```

## 24. Ejemplo tecnico completo: hacer una resena

Accion:

```text
Usuario escribe una resena en una pelicula
```

Recorrido:

```text
1. resena.js lee texto, puntuacion, idCuenta e idContenido.
2. Hace POST /api/resenas.
3. ResenaController recibe el body.
4. ResenaService valida la operacion.
5. ResenaRepository guarda en SQL.
6. SQL inserta en Resena.
7. Backend devuelve respuesta correcta.
8. Frontend recarga las resenas.
```

Tablas:

```text
Resena
Cuenta
Contenido
```

Regla:

```text
Una cuenta solo puede tener una resena por contenido.
```

## 25. Ejemplo tecnico completo: guardar en lista

Accion:

```text
Usuario guarda una pelicula en "Favoritas"
```

Recorrido:

```text
1. listas-widget.js lee JAM_profile.
2. Obtiene idCuenta.
3. Pide listas de esa cuenta.
4. Usuario selecciona una lista.
5. Frontend manda POST /api/listas/{idLista}/contenidos/{idContenido}.
6. ListaController recibe ids.
7. ListaService comprueba la relacion.
8. ListaTieneContenidoRepository guarda.
9. SQL inserta en ListaTieneContenido.
10. Frontend muestra que ya esta guardada.
```

Tablas:

```text
Cuenta
Lista
ListaTieneContenido
Contenido
```

## 26. Como estudiar el proyecto completo

No intentes memorizar todo por archivos. Estudialo por flujos.

Flujos mas importantes:

```text
Login
Elegir perfil
Buscar contenido
Filtrar por categoria
Abrir detalle
Guardar en lista
Crear resena
Abrir trabajador
Ver serie con episodios
Pagar plan
```

Para cada flujo, preguntate:

```text
Que hace el usuario?
Que archivo JS responde?
Que endpoint se llama?
Que controller lo recibe?
Que tablas se usan?
Que se pinta al final?
```

Si puedes responder eso, sabes explicar el sistema.

## 27. Frase tecnica global

Puedes usar esta frase en una exposicion:

> La aplicacion esta dividida en tres capas. El frontend se encarga de la interfaz y hace peticiones con fetch. El backend, hecho con Spring Boot, recibe esas peticiones en controllers, aplica logica en services y consulta MySQL mediante repositories. La base de datos guarda usuarios, contenidos, categorias, trabajadores, listas y resenas, y sus relaciones permiten que desde una pantalla se pueda navegar entre peliculas, series, categorias y trabajadores.

## 28. Resumen final

La forma mas facil de entender JAM es esta:

```text
Frontend = lo que el usuario ve y usa
Backend  = quien decide y responde
SQL      = donde viven los datos
```

Y cada accion sigue este camino:

```text
Click o busqueda
  -> JavaScript
  -> fetch endpoint
  -> Controller
  -> Service
  -> Repository
  -> Tabla SQL
  -> JSON
  -> HTML actualizado
```

Ese es el funcionamiento conjunto de la pagina.
