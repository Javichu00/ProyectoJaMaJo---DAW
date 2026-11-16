# Backend - Guia tecnica facil

El backend es la API de la aplicacion. Es la parte que recibe peticiones del frontend, busca o guarda datos en MySQL y devuelve respuestas en JSON.

Esta hecho con:

```text
Java + Spring Boot + Spring Data JPA + MySQL
```

Ruta principal:

```text
Back/ProyectoSpring_BackendJaMaJo
```

## 1. Idea principal

El backend funciona como intermediario entre el frontend y la base de datos.

```text
Frontend
  -> llama a un endpoint
Backend
  -> recibe la peticion
  -> aplica logica
  -> consulta MySQL
  -> devuelve JSON
Frontend
  -> pinta los datos
```

Ejemplo:

```text
pelicula.js pide /api/contenidos/12
  -> ContenidoController recibe la peticion
  -> ContenidoService busca el contenido
  -> ContenidoRepository consulta MySQL
  -> backend devuelve la pelicula en JSON
```

## 2. Archivo que arranca el backend

El proyecto arranca desde:

```text
ProyectoSpringBackendJaMaJoApplication.java
```

Ese archivo tiene el `main`.

Cuando se ejecuta, Spring Boot:

1. Levanta el servidor.
2. Lee la configuracion.
3. Detecta controladores, servicios y repositorios.
4. Deja disponibles los endpoints bajo `/api/...`.

## 3. Configuracion importante

Archivo:

```text
src/main/resources/application.properties
```

Cosas importantes:

```properties
server.address=0.0.0.0
spring.datasource.url=jdbc:mysql://localhost:3306/JAMAJO_DDBB
spring.jpa.hibernate.ddl-auto=none
spring.jpa.open-in-view=false
```

Explicacion sencilla:

```text
server.address=0.0.0.0
```

El backend acepta conexiones desde otros dispositivos de la red, no solo desde localhost.

```text
spring.datasource.url
```

Dice donde esta la base de datos MySQL.

```text
ddl-auto=none
```

Spring no crea tablas automaticamente. Las tablas se crean con los scripts SQL.

```text
open-in-view=false
```

Obliga a cargar los datos necesarios dentro del servicio, no despues de cerrar la transaccion. Es mas controlado.

## 4. CORS

Archivo:

```text
config/CorsConfig.java
```

CORS permite que el frontend pueda llamar al backend aunque esten en origenes distintos.

Ejemplo:

```text
Frontend: http://localhost:5500
Backend:  http://192.168.1.222:8080
```

Sin CORS, el navegador bloquearia muchas peticiones.

## 5. Capas del backend

El backend esta dividido en capas.

```text
controller -> service -> repository -> entity -> SQL
```

Cada capa tiene una responsabilidad.

## 6. Controller

Carpeta:

```text
controller
```

Un controller define endpoints.

Ejemplo mental:

```text
GET /api/contenidos/12
```

Llega al controller de contenidos.

El controller se encarga de:

- Definir la ruta.
- Leer parametros de URL.
- Leer body si hay POST o PUT.
- Llamar al service.
- Devolver una respuesta HTTP.

Lo que NO deberia hacer:

- Meter mucha logica de negocio.
- Hacer consultas complicadas directamente.

## 7. Service

Carpeta:

```text
service
```

El service contiene la logica real.

Ejemplo:

```text
ContenidoService
```

Puede decidir:

- Como buscar contenidos.
- Como ordenar resultados.
- Como montar un DTO.
- Como calcular recomendaciones.
- Que hacer si no existe un dato.

Piensa en el service como el cerebro de cada modulo.

## 8. Repository

Carpeta:

```text
repository
```

El repository habla con MySQL usando JPA.

Ejemplo:

```text
ContenidoRepository
```

Sirve para:

- Buscar por id.
- Buscar por titulo.
- Buscar por categoria.
- Ordenar.
- Guardar.
- Borrar.

Spring Data JPA permite crear consultas usando nombres de metodos o anotaciones.

El repository no deberia saber como se pinta la web. Solo sabe consultar datos.

## 9. Entity

Carpeta:

```text
entity
```

Una entity representa una tabla SQL.

Ejemplo:

```text
Contenido.java -> tabla Contenido
Usuario.java   -> tabla Usuarios
Resena.java    -> tabla Resena
```

La entity le dice a Java:

- Que tabla representa.
- Que columna es clave primaria.
- Que relaciones tiene.
- Que tipos de datos usa.

## 10. DTO

Carpeta:

```text
DTO
```

DTO significa "Data Transfer Object".

En sencillo:

```text
Un DTO es el objeto que se manda o recibe por la API.
```

No siempre conviene devolver la entity completa porque puede tener:

- Relaciones internas.
- Campos que no necesita el frontend.
- Riesgo de bucles entre entidades.
- Datos sensibles.

Ejemplo:

```text
Contenido entity
  -> contiene datos como tabla
ContenidoDTO
  -> contiene solo lo que el frontend necesita pintar
```

## 11. Flujo completo de un endpoint

Ejemplo con detalle de pelicula:

```text
GET /api/contenidos/12
```

Paso a paso:

```text
1. El navegador hace fetch.
2. ContenidoController recibe id=12.
3. ContenidoController llama a ContenidoService.
4. ContenidoService busca el contenido.
5. ContenidoRepository consulta la tabla Contenido.
6. Si es pelicula, tambien se usa la informacion de Pelicula.
7. Se prepara un DTO.
8. El controller devuelve JSON.
9. El frontend pinta la ficha.
```

Esto mismo pasa con casi todos los endpoints.

## 12. Modulo de contenidos

Archivos principales:

```text
ContenidoController
ContenidoService
ContenidoRepository
Contenido
ContenidoDTO
```

Este modulo es el centro del catalogo.

Controla:

- Buscar peliculas y series.
- Obtener un contenido por id.
- Filtrar por tipo: pelicula o serie.
- Filtrar por categoria.
- Obtener tops: mas votados, mejor puntuados, recientes, largas.
- Obtener recomendaciones.
- Obtener actores de un contenido.
- Contar total de contenidos, peliculas y series.

Endpoints importantes:

```text
GET /api/contenidos/{id}
GET /api/contenidos/buscar
GET /api/contenidos/categoria/{nombreCategoria}
GET /api/contenidos/{id}/actores
GET /api/contenidos/{id}/recomendados
GET /api/contenidos/contar
```

Idea clave:

```text
Contenido es la tabla base.
Pelicula y Serie son datos especificos encima de Contenido.
```

Por eso una busqueda general puede mezclar peliculas y series.

## 13. Modulo de trabajadores

Archivos principales:

```text
TrabajadorController
TrabajadorService
TrabajadorRepository
Trabajador
ActorDTO
```

Controla:

- Buscar trabajadores por nombre.
- Obtener un trabajador por id.
- Obtener su filmografia.

Endpoints importantes:

```text
GET /api/trabajadores/buscar?q=...
GET /api/trabajadores/{id}
GET /api/trabajadores/{id}/filmografia
```

Idea clave:

```text
Un trabajador puede ser director o actor.
```

Director:

```text
Contenido.id_director apunta a Trabajadores.id_trabajador
```

Actor:

```text
ActorParticipa une Contenido con Trabajadores
```

## 14. Modulo de episodios

Archivos principales:

```text
EpisodioController
EpisodioService
EpisodioRepository
Episodio
Temporada
Serie
```

Controla:

- Obtener todos los episodios de una serie.
- Obtener un episodio concreto.

Endpoints importantes:

```text
GET /api/episodios/serie/{idContenido}
GET /api/episodios/contenido/{idContenido}/temporada/{nTemporada}/episodio/{nEpisodio}
```

Idea clave:

```text
Contenido -> Serie -> Temporada -> Episodio
```

El frontend no necesita entender toda la estructura SQL. Pide los episodios y el backend los devuelve ordenados.

## 15. Modulo de resenas

Archivos principales:

```text
ResenaController
ResenaService
ResenaRepository
Resena
ResenaDTO
ResenaCreateDTO
ResenaUpdateDTO
```

Controla:

- Ver resenas de un contenido.
- Ver media de puntuacion.
- Crear resena.
- Editar resena.
- Borrar resena.

Endpoints importantes:

```text
GET /api/resenas/contenido/{idContenido}
GET /api/resenas/contenido/{idContenido}/media
POST /api/resenas
PUT /api/resenas/{idResena}
DELETE /api/resenas/{idResena}
```

Idea clave:

```text
Una resena pertenece a una cuenta y a un contenido.
```

Por eso para crearla se necesitan:

```text
idCuenta
idContenido
texto
puntuacion
```

Tambien hay una regla importante:

```text
Una misma cuenta solo puede tener una resena por contenido.
```

Eso se controla con una restriccion en SQL y con logica en backend.

## 16. Modulo de listas

Archivos principales:

```text
ListaController
ListaService
ListaRepository
ListaTieneContenidoRepository
Lista
ListaTieneContenido
```

Controla:

- Ver listas de una cuenta.
- Crear listas.
- Renombrar listas.
- Borrar listas.
- Ver contenidos dentro de una lista.
- Anadir contenido a una lista.
- Quitar contenido de una lista.

Endpoints importantes:

```text
GET /api/listas/cuenta/{idCuenta}
POST /api/listas/cuenta/{idCuenta}
GET /api/listas/{idLista}/contenidos
POST /api/listas/{idLista}/contenidos/{idContenido}
DELETE /api/listas/{idLista}/contenidos/{idContenido}
```

Idea clave:

```text
Las listas pertenecen a una cuenta/perfil, no directamente al usuario.
```

## 17. Modulo de usuarios y cuentas

Archivos principales:

```text
UsuarioController
UsuarioService
UsuarioRepository
CuentaController
CuentaService
CuentaRepository
Usuario
Cuenta
```

Usuario representa:

- Email.
- Password.
- Plan.
- Tipo de usuario: ADMIN o CLIENTE.
- Si esta activo.

Cuenta representa:

- Perfil dentro de un usuario.
- Nombre visible.
- Avatar.

Relacion:

```text
Usuario 1 -> muchas Cuentas
```

Endpoints importantes de usuarios:

```text
GET /api/usuarios/{email}
GET /api/usuarios/{email}/{password}
POST /api/usuarios
PUT /api/usuarios/{email}
DELETE /api/usuarios/{email}
```

Endpoints importantes de cuentas:

```text
GET /api/cuentas/{email}
GET /api/cuentas/id/{idCuenta}
POST /api/cuentas/{email}
PUT /api/cuentas/{idCuenta}
DELETE /api/cuentas/{idCuenta}
```

Idea clave:

```text
El usuario paga y tiene plan.
La cuenta/perfil es quien ve contenido, hace resenas y tiene listas.
```

## 18. Modulo de planes y pagos

Archivos principales:

```text
PlanController
PlanService
PlanRepository
PagoController
PagoService
PagoRepository
Plan
Pago
```

Planes:

- GRATIS.
- ANUNCIOS.
- ESTANDAR.
- PRO.

Pagos:

- Guardan que usuario pago.
- Guardan que plan compro.
- Guardan importe y fecha.
- Actualizan el plan activo del usuario.

Endpoints importantes:

```text
GET /api/planes
GET /api/planes/{nombrePlan}
GET /api/pagos/{email}
POST /api/pagos/{email}
```

Idea clave:

```text
El pago no es solo un registro.
Tambien cambia el plan del usuario.
```

## 19. Modulo TMDB

Archivos principales:

```text
TmdbController
TmdbService
Tmdb DTOs
```

TMDB se usa para traer imagenes externas.

Endpoints importantes:

```text
GET /api/tmdb/{id}/movieImages
GET /api/tmdb/{id}/serieImages
GET /api/tmdb/{tvId}/season/{season}/episode/{episode}/images
```

Idea clave:

```text
El backend actua como puente entre el frontend y TMDB.
```

El frontend no llama directamente a TMDB; llama al backend, y el backend filtra lo que hace falta.

## 20. Email y verificacion

Carpeta:

```text
email
```

Sirve para:

- Mandar codigos de verificacion.
- Recuperar contrasena.
- Confirmar pagos.

Endpoints relacionados:

```text
POST /api/usuarios/solicitar-verificacion
POST /api/usuarios/verificar-email
POST /api/usuarios/{email}/solicitar-recuperacion
POST /api/usuarios/{email}/validar-token
POST /api/usuarios/{email}/confirmar-pago
```

Idea clave:

```text
El backend genera codigos, los guarda temporalmente y los valida cuando el usuario los introduce.
```

## 21. Scheduler

Carpeta:

```text
scheduler
```

Tiene una tarea programada relacionada con expiracion de planes.

Idea:

```text
Cada cierto tiempo el backend puede revisar usuarios cuyo plan haya caducado.
```

Esto permite automatizar reglas sin que el usuario tenga que entrar a la pagina.

## 22. Como devuelve datos el backend

Normalmente devuelve JSON.

Ejemplo conceptual:

```json
{
  "id": 12,
  "tituloPrincipal": "Interstellar",
  "tipoContenido": "PELICULA",
  "imagenUrl": "...",
  "nota": 8.7
}
```

El frontend recibe ese JSON y lo transforma en HTML.

## 23. Como se controlan errores

El backend puede responder:

```text
200 OK
```

Todo bien.

```text
201 CREATED
```

Algo se creo correctamente.

```text
204 NO CONTENT
```

Operacion correcta sin devolver cuerpo.

```text
400 BAD REQUEST
```

La peticion tiene datos incorrectos.

```text
404 NOT FOUND
```

No se encontro el dato.

```text
500 INTERNAL SERVER ERROR
```

Error inesperado del servidor.

El frontend suele mirar si `response.ok` es true o false para saber si salio bien.

## 24. Como explicar el backend sin liarte

Puedes decir:

> El backend esta organizado por capas. Los controllers reciben las peticiones, los services contienen la logica, los repositories consultan MySQL y las entities representan las tablas. Para no mandar datos de mas al frontend, muchas respuestas se preparan como DTOs.

Y si quieres explicarlo con un ejemplo:

> Cuando abro una pelicula, el frontend llama a `/api/contenidos/{id}`. El controller recibe el id, el service busca la pelicula, el repository consulta la base de datos y el backend devuelve un JSON para que el frontend pinte la ficha.

## 25. Resumen final

El backend funciona asi:

```text
Endpoint recibe peticion
  -> Controller
  -> Service
  -> Repository
  -> MySQL
  -> Repository devuelve datos
  -> Service prepara respuesta
  -> Controller devuelve JSON
  -> Frontend pinta pantalla
```

Si entiendes ese recorrido, entiendes la base del backend.
