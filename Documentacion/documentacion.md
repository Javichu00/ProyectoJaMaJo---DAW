# Proyecto JAM

tescudero@planetafp.es

**JAM** es una plataforma web de exploración y descubrimiento de contenido cinematográfico, con un enfoque cercano a plataformas de streaming (Netflix, Prime Video) y portales de catálogo y fichas como IMDb o JustWatch. Desarrollada por Jorge, Javier y Marcelo como proyecto final del ciclo de Desarrollo de Aplicaciones Web en las asignaturas **Entornos de desarrollo**, **Bases de datos**, **Programación** y **Lenguajes de Marcas**.

La plataforma permite explorar un catálogo de miles de películas y series, concretamente las producciones más populares y valoradas de IMDb, lo que representa una barbaridad de contenido: desde clásicos del cine hasta las series más recientes, con sus temporadas y episodios individuales, actores, directores, categorías, tráilers y mucho más.

Para ello, en un principio planteamos usar **React** para el frontend y **Python** para el backend, pero decidimos que era mejor usar los conocimientos que ya teníamos debido a lo ambicioso del proyecto y a la multitud de cosas que queríamos hacer. No nos podíamos permitir dedicar tanto tiempo al aprendizaje de estas nuevas tecnologías para este proyecto, así que hemos usado los entornos que mejor conocemos: **HTML + CSS + JS puro** (con Tailwind para los estilos) en el frontend, **Java con Hibernate** para el backend, y la base de datos está en **MySQL**, construida mediante scripts de Python, los cuales llaman a las APIs de **IMDb** y **TMDB**, y utilizan las respuestas para construir archivos `.sql` que rellenan la BBDD con miles de películas, series, con sus respectivos episodios, directores y actores.

---

# Proceso de desarrollo

## Diseño inicial

Lo primero que hicimos fue un diseño de la base de datos con el objetivo de darle forma al proyecto en sí: entidades, relaciones y casos de uso en torno al contenido audiovisual y a los usuarios.

En base a la temática y a las ideas que teníamos para el funcionamiento y el objetivo de nuestra página, diseñamos un **mapa mental** para ir definiendo las entidades que tendría nuestro proyecto y las relaciones entre ellas. Una vez con ese esquema, nos pusimos manos a la obra:

- Creación de las tablas de la base de datos.
- Desarrollo de las entidades y todas las clases relacionadas del backend (services, repositories...).
- Diseño de la página web, escogiendo colores, disposiciones, menús...

---

## Relleno de la base de datos

Posteriormente, nos metimos a fondo con rellenar la base de datos y nos dimos cuenta de cómo íbamos a necesitar una **cantidad ingente de contenido**.

Por ejemplo:

- Si tuviéramos 100 producciones audiovisuales y 5 categorías, al hacer un filtro de "películas de la categoría A", solo tendríamos 10 películas con ese filtro (asumiendo una distribución equitativa).
- Si quisiéramos tener los episodios de cada serie, sería inmanejable introducir las producciones manualmente.

Dado este problema, investigamos soluciones y decidimos usar el método de los **scripts de Python**.

---

## Scripts de Python

El proceso para esta solución no fue sencillo:

1. Encontramos una descarga en internet de un archivo que relacionaba **IDs de IMDb** con el número de votos en dicha plataforma.
2. Filtramos estos IDs para seleccionar solo películas y series.
3. Iteramos en Python y realizamos llamadas a las APIs para rellenar sentencias de SQL que completaban las tablas de la base de datos.

---

## Desarrollo del backend y frontend

Una vez tuvimos los scripts de Python y los archivos `.sql` (los cuales tuvimos que refactorizar infinitud de veces para añadir datos y otros cambios), pudimos empezar a:

- Crear **endpoints** en los controllers del backend.
- Avanzar poco a poco en el frontend, construyendo nuestra web con datos sacados de la base de datos.

En el frontend, utilizamos librerías como **GSAP** para mejorar la visualización de la página con animaciones y otros detalles.

---

# Tecnologías utilizadas

## Lenguajes

- **HTML, CSS y JavaScript**
- **Java**
- **Python**
- **SQL**

## Librerías

### CSS
- TailWindCSS
- GSAP

### Scripts Python
- Requests
- Threading

### Dependencias Spring:
- Spring Boot Starter Mail (JavaMailSender)

## Programas

- Spring Tools for Eclipse - Spring Data JPA
- Visual Studio Code
- MySQL Workbench
- Postman
- Git

## Recursos online

- https://www.w3schools.com
- https://excalidraw.com
- https://developer.mozilla.org

## Inteligencias Artificiales

- Claude.ai
- ChatGPT

## APIs

- IMDb (Para la construcción únicamente)
- TMDB (Construcción y peticiones en tiempo de ejecución)
- Gmail SMTP (envío de correos transaccionales)

---

# Base de datos

El esquema de la base de datos gira en torno a la entidad central **Contenido**, que representa cualquier producción audiovisual y se especializa en dos subtipos mediante herencia:

- **Contenido**: Entidad base. Almacena título, descripción, fecha, nota, votos, tráiler, imagen y director de cada película y cada serie.
- **Película**: Extiende Contenido. Añade el campo duración ya que es un dato que las series no tienen.
- **Serie**: Extiende Contenido. Se relaciona con sus temporadas; las películas no tienen temporadas.
- **Temporada**: Pertenece a una Serie. Tiene número de temporada y nombre, para unir con episodios y contabilizar.
- **Episodio**: Pertenece a una Temporada. Almacena título, descripción, duración y fecha de emisión con una foto también para cada episodio.
- **Trabajador**: Actores y directores. Se relaciona con Contenido como director (relación directa de momento, solo 1 director) y como actor (ActorParticipa).
- **ActorParticipa**: Relación N:M entre Trabajador y Contenido, con el rol del actor en la producción para en un futuro rellenar ese dato con las APIs.
- **Categoría**: Categorías de contenido (Acción, Terror, Drama...).
- **ContenidoPerteneceACategoria**: Relación N:M entre Contenido y Categoría para asociar qué película o serie pertenece a qué categoría.
- **Usuario**: Usuarios de la plataforma. Tienen email, contraseña, perfil (ADMIN/CLIENTE) y un plan de suscripción activo por defecto gratis. Incluye además `reset_token` (código de 6 dígitos para recuperación de contraseña) y `reset_token_expira` (fecha y hora de expiración del código, 15 minutos desde su generación).
- **Cuenta**: Subcuentas de un usuario, estilo perfiles de Netflix. Tienen username e id de avatar (número del 1 al 6, referenciando imágenes estáticas en `multimedia/AvataresCuentas/Perfil{n}.png`). Cada plan limita el número de cuentas posibles.
- **Plan**: Planes de suscripción: GRATIS, ANUNCIOS, ESTÁNDAR, PRO, con su precio.
- **Pago**: Historial de pagos de los usuarios. Registra el plan contratado, importe y fecha.
- **Lista**: Listas de contenido creadas por cuentas (no por el usuario global). Cada lista pertenece a una cuenta concreta.
- **ListaTieneContenido**: Relación N:M entre Lista y Contenido.

---

# Estructura Backend

Nuestra web contiene muchos endpoints para modular las peticiones a la base de datos. Hay muchos tipos distintos y muchos datos que recoger, así que hay muchos.

## Endpoints del backend

### /api/contenidos

```
GET /api/contenidos/{id}
-> Devuelve un contenido por su ID. Si es película incluye el campo duracion. Incluye también el array de categorias.

GET /api/contenidos/{id}/actores
-> Devuelve los actores de un contenido

GET /api/contenidos/{id}/recomendados
-> Devuelve aprox 12 contenidos recomendados basados en director, categorías, época y título

GET /api/contenidos/contar
-> Devuelve el total de contenido, películas y series

GET /api/contenidos/top/votados
-> Top 18 contenidos con más votos

GET /api/contenidos/top/puntos
-> Top 18 contenidos mejor puntuados

GET /api/contenidos/top/recientes
-> Top 18 contenidos más recientes

GET /api/contenidos/top/largas
-> Top 18 películas más largas

POST /api/contenidos/top/por-nombres
-> Devuelve contenidos cuyo título coincida con una lista de nombres enviada en el body

GET /api/contenidos/buscar?q=&tipo=&orden=&dir=&page=
-> Búsqueda por título con paginación de 24, filtro por tipo y ordenación

GET /api/contenidos/por-categorias?categorias=&tipo=&orden=&dir=&page=
-> Búsqueda por categorías (AND exclusivo: solo contenidos con todas las categorías indicadas) con paginación de 49

GET /api/contenidos/categoria/{nombreCategoria}?page=
-> Devuelve contenidos de una categoría ordenados por votos DESC, paginación de 49

POST /api/contenidos
-> Crea un nuevo contenido (No lo vamos a usar)

PUT /api/contenidos/{id}
-> Actualiza un contenido existente (No lo vamos a usar)

DELETE /api/contenidos/{id}
-> Elimina un contenido (No lo vamos a usar)
```

### /api/episodios

```
GET /api/episodios/serie/{idContenido}
-> Devuelve todos los episodios de una serie ordenados por temporada y episodio

GET /api/episodios/contenido/{idContenido}/temporada/{nTemporada}/episodio/{nEpisodio}
-> Devuelve un episodio concreto (idContenido = id del contenido en BD)
```

### /api/trabajadores

```
GET /api/trabajadores
-> Devuelve todos los actores y directores (No usar, genérico)

GET /api/trabajadores/{id}
-> Devuelve un trabajador por su ID

GET /api/trabajadores/{id}/filmografia
-> Devuelve todas las producciones en las que ha participado un trabajador (así podemos mostrar todas las películas de un actor)
```

### /api/usuarios

```
GET /api/usuarios
-> Devuelve todos los usuarios

GET /api/usuarios/{email}
-> Devuelve un usuario por su email (PK)

GET /api/usuarios/{email}/{password}
-> Devuelve un booleano si la password es correcta o no

POST /api/usuarios
-> Crea un nuevo usuario y su cuenta principal (se le asigna el plan GRATIS automáticamente)

PUT /api/usuarios/{email}
-> Actualiza campos opcionales: enabled, password o tipoUsuario (ADMIN/CLIENTE)

DELETE /api/usuarios/{email}
-> Deshabilita un usuario (enabled = 0, no borra el registro para conservar listas, pagos, etc.)

POST /api/usuarios/{email}/solicitar-recuperacion
-> Genera un código de 6 dígitos, lo guarda en BD con expiración de 15 minutos y lo envía al email del usuario

POST /api/usuarios/{email}/validar-token
-> Valida el código de recuperación recibido
-> Body: { token }

POST /api/usuarios/{email}/confirmar-pago
-> Envía un email de confirmación de pago al usuario con el nombre y precio del plan contratado
-> Body: { plan }

POST /api/usuarios/solicitar-verificacion
-> Envía un código de 6 dígitos al email para verificarlo antes del registro
-> Body: { email }

POST /api/usuarios/verificar-email
-> Valida el código de verificación de registro
-> Body: { email, token }
```



### /api/cuentas

```
GET /api/cuentas/{email}
-> Devuelve todas las cuentas de un usuario

GET /api/cuentas/id/{idCuenta}
-> Devuelve los datos de una cuenta por su ID

POST /api/cuentas/{email}
-> Crea una cuenta adicional (valida el límite según el plan: GRATIS=1, ANUNCIOS=2, ESTANDAR=4, PRO=6)
-> Body: { username, idFoto }

PUT /api/cuentas/{idCuenta}
-> Actualiza el username o el avatar (idFoto) de una cuenta
-> Body: { username, idFoto }

DELETE /api/cuentas/{idCuenta}?password=
-> Elimina una cuenta (requiere la contraseña del usuario como parámetro)
```

Los avatares de cuenta se referencian mediante un número entero (`idFoto`) del 1 al 6. Las imágenes se sirven desde rutas estáticas locales: `multimedia/AvataresCuentas/Perfil{idFoto}.png`.

### /api/planes

```
(Estos planes son bastante estáticos así que no tienen demasiados métodos)

GET /api/planes
-> Devuelve todos los planes de suscripción disponibles

GET /api/planes/{nombrePlan}
-> Devuelve un plan por su nombre

PUT /api/planes/{nombrePlan}
-> Actualiza el precio de un plan
-> Body: { precio }
```

### /api/pagos

```
GET /api/pagos
-> Devuelve todos los pagos (genérico, no usar en frontend)

GET /api/pagos/{email}
-> Devuelve el historial de pagos de un usuario

POST /api/pagos/{email}
-> Registra un nuevo pago y actualiza el plan activo del usuario
```

### /api/listas

```
Las listas pertenecen a cuentas (no a usuarios directamente). Se identifican por idCuenta.

GET /api/listas/cuenta/{idCuenta}
-> Devuelve todas las listas de una cuenta

GET /api/listas/cuenta/{idCuenta}/contar
-> Devuelve el número de listas de una cuenta

GET /api/listas/{idLista}/contenidos
-> Devuelve los contenidos de una lista concreta

POST /api/listas/cuenta/{idCuenta}
-> Crea una nueva lista para esa cuenta
-> Body: { nombre }

PUT /api/listas/{idLista}
-> Renombra una lista
-> Body: { nombre }

DELETE /api/listas/{idLista}
-> Elimina una lista y todos sus contenidos asociados

POST /api/listas/{idLista}/contenidos/{idContenido}
-> Añade un contenido a una lista (devuelve error si ya existe)

DELETE /api/listas/{idLista}/contenidos/{idContenido}
-> Quita un contenido de una lista
```

### /api/tmdb

```
(Estos métodos utilizan varios DTOs para filtrar todos los datos ya que las llamadas a TMDB devuelven muchas cosas que no necesitamos)

GET /api/tmdb/{id}/movieImages
-> Devuelve imágenes de una película desde la API de TMDB

GET /api/tmdb/{id}/serieImages
-> Devuelve imágenes de una serie desde la API de TMDB

GET /api/tmdb/{tvId}/season/{season}/episode/{episode}/images
-> Devuelve la imagen de un episodio concreto desde TMDB
```

### /api/resenas

```
GET /api/resenas/cuenta/{idCuenta}
-> Devuelve todas las reseñas de una cuenta

GET /api/resenas/contenido/{idContenido}
-> Devuelve todas las reseñas de un contenido

GET /api/resenas/contenido/{idContenido}/media
-> Devuelve la puntuación media de un contenido

POST /api/resenas
-> Crea una reseña. Body: { idCuenta, idContenido, texto, puntuacion }

PUT /api/resenas/{idResena}?idCuenta=
-> Modifica texto y/o puntuación de una reseña de la cuenta creadora

DELETE /api/resenas/{idResena}?idCuenta=
-> Elimina una reseña de la cuenta creadora o de una cuenta ADMIN
```

### /api/email

```
El sistema de emails utiliza JavaMailSender con una cuenta Gmail dedicada a la aplicación, 
autenticada mediante contraseña de aplicación de Google (no la contraseña real de la cuenta) 
a través del puerto 587 con STARTTLS. Los correos son HTML.

Los correos transaccionales implementados son:

- **Recuperación de contraseña**: El usuario solicita un código de 6 dígitos que se guarda 
en BD junto a su fecha de expiración (15 minutos). El código se envía al email del usuario 
y debe ser validado antes de que expire para proceder al cambio de contraseña.

- **Confirmación de pago**: Tras registrar un pago, se envía al usuario un email con el 
nombre del plan contratado y su precio.

- **Verificación de email**: Antes del registro, se envía y valida un código de 6 dígitos.
```


---

# Estructura Frontend

En el frontend, hemos utilizado **HTML, CSS y JavaScript puro** con **TailwindCSS** para los estilos. Además, hemos integrado animaciones con **GSAP** para mejorar la experiencia visual. La estructura incluye:

- **Página principal**: Muestra el catálogo de contenido.
- **Detalles de contenido**: Información detallada de películas y series.
- **Búsqueda avanzada**: Filtros y ordenación para encontrar contenido específico.
- **Gestión de usuarios**: Registro, inicio de sesión y gestión de planes de suscripción.
- **Listas**: Página dedicada donde cada cuenta puede crear, renombrar, eliminar y gestionar sus listas de contenido. También hay un widget global que aparece en las fichas de películas y series para añadir o quitar ese contenido de cualquier lista existente.
- **Perfiles**: Selección y gestión de cuentas al iniciar sesión, con soporte de avatares (6 opciones).
- **Dashboard de administrador**: Panel exclusivo accesible solo para usuarios con rol `ADMIN`. Redirige automáticamente a la landing si el usuario no tiene permisos. Incluye tres secciones principales:
  - **Usuarios**: Tabla con todos los usuarios registrados, su estado (activo/inactivo), rol, plan y fecha de registro. Permite crear nuevos usuarios, habilitar o deshabilitar cuentas existentes, ver el detalle de cada usuario (cuentas asociadas, cambio de contraseña, cambio de plan y cambio de rol entre `CLIENTE` y `ADMIN`), y eliminar cuentas individuales de un usuario.
  - **Pagos**: Historial completo de pagos de todos los usuarios, con métricas de total recaudado, número de pagos y cliente con mayor gasto. Permite también registrar pagos manuales.
  - **Planes**: Visualización de los cuatro planes disponibles (GRATIS, ANUNCIOS, ESTÁNDAR, PRO) con el número de usuarios en cada uno, ingresos mensuales estimados y la posibilidad de editar el precio de cada plan.

---

# Casos de uso

La plataforma distingue dos tipos de usuario: **ADMIN** y **CLIENTE**.

## Administrador
Los usuarios con rol `ADMIN` tienen acceso al dashboard de administración, donde pueden gestionar usuarios (crear, habilitar, deshabilitar, cambiar plan y rol), revisar el historial de pagos y administrar los planes de suscripción.

## Cliente no registrado
Puede explorar el catálogo libremente, pero no puede interactuar: no puede crear listas ni reproducir contenido.

## Cliente con plan gratuito
Plan asignado por defecto al registrarse. Puede crear listas, pero no tiene acceso a la reproducción. Solo puede tener 1 subcuenta.

## Cliente con plan Anuncios
Puede ver el contenido con anuncios (aún por implementar) y tener hasta 2 subcuentas.

## Cliente con plan Estándar
Sin anuncios y con hasta 4 subcuentas.

## Cliente con plan Pro
Acceso a contenido en 4K y hasta 6 subcuentas.