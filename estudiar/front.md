# Frontend - Guia tecnica facil

El frontend es la parte que ve el usuario: las pantallas, botones, cards, formularios, carruseles y detalles de peliculas o series.

Esta hecho con:

```text
HTML  -> estructura de cada pagina
CSS   -> diseno visual
JS    -> comportamiento, peticiones al backend y pintado dinamico
```

No usa React ni Angular. Es JavaScript normal del navegador.

Ruta principal:

```text
Front/codigo
```

## 1. Idea principal

Piensa en el frontend como una capa que hace tres cosas:

1. Muestra una pagina HTML.
2. Pide datos al backend usando `fetch`.
3. Con esos datos construye las cards, listas, formularios o detalles.

Ejemplo sencillo:

```text
Usuario entra en peliculas.html
  -> peliculas.js prepara la pagina
  -> catalog-discovery.js pide peliculas al backend
  -> backend devuelve JSON
  -> el frontend crea las cards y las mete en el HTML
```

Esa idea se repite en casi toda la web.

## 2. Carpetas importantes

```text
Front/codigo/html
```

Aqui estan las paginas. Cada archivo representa una pantalla.

```text
Front/codigo/css
```

Aqui estan los estilos. Hay un CSS general y otros por pantalla.

```text
Front/codigo/js
```

Aqui esta la logica. Cada pagina suele tener su propio archivo JS.

```text
Front/codigo/multimedia
```

Aqui estan imagenes, videos y recursos visuales.

## 3. Archivos globales

Estos archivos afectan a muchas paginas.

### `api_IP.js`

Define la direccion del backend:

```js
const API_BASE = 'http://192.168.1.222:8080/api'
```

Esto significa:

```text
API_BASE = donde vive la API del backend
```

Cuando el frontend quiere pedir peliculas, usuarios o resenas, construye URLs usando esa base.

Ejemplo:

```js
fetch(`${API_BASE}/contenidos/buscar?tipo=PELICULA`)
```

Si el backend cambia de IP, normalmente solo hay que cambiar este archivo.

### `script.js`

Es el archivo global mas importante.

Hace cosas compartidas:

- Crea el objeto global `window.JAM`.
- Pinta o controla partes comunes como header y footer.
- Guarda funciones reutilizables.
- Normaliza datos que llegan del backend.
- Construye cards de contenido.
- Construye secciones de trabajadores.
- Tiene helpers para llamar endpoints frecuentes.
- Lee usuario y perfil desde `localStorage`.

Piensa en `window.JAM` como una caja de herramientas global.

Ejemplo:

```text
pelicula.js necesita una card
  -> usa window.JAM.buildCatalogCard()
```

Asi no hay que repetir la misma card en todos los archivos.

### `style.css`

Es el CSS general.

Contiene estilos compartidos:

- Header.
- Footer.
- Cards de contenido.
- Botones.
- Layout general.
- Skeletons de carga.
- Estilos base de detalles.

Si algo se usa en muchas paginas, normalmente esta aqui.

### `catalog-discovery.js`

Es el motor reutilizable de paginas tipo catalogo.

Lo usan principalmente:

```text
peliculas.js
series.js
```

Sirve para no repetir toda la logica de:

- Buscador.
- Ordenacion.
- Paginacion.
- Carruseles.
- Carga de cards.
- Estados de cargando.
- Boton de limpiar.

La idea es:

```text
peliculas.js dice: quiero montar un catalogo de peliculas
series.js dice: quiero montar un catalogo de series
catalog-discovery.js hace el trabajo comun
```

### `resena.js`

Controla el bloque de resenas.

Se usa en:

```text
pelicula.html
serie.html
```

Hace:

- Cargar resenas de un contenido.
- Cargar la media de puntuacion.
- Crear una resena.
- Editar una resena.
- Borrar una resena.
- Comprobar que haya usuario/perfil activo.

### `listas-widget.js`

Controla el popup para guardar contenido en listas.

Se usa cuando el usuario esta en el detalle de una pelicula o serie y pulsa guardar/anadir a lista.

Hace:

- Lee el perfil activo.
- Pide las listas de esa cuenta.
- Permite crear lista.
- Permite meter o quitar contenido de una lista.

### `trabajador-links.js`

Hace que directores y actores sean clicables.

La idea:

```text
Pelicula muestra director y actores
  -> trabajador-links.js los convierte en enlaces
  -> al hacer clic vas a trabajador.html?id=...
```

## 4. Como carga una pagina

Una pagina normal sigue este orden:

```text
1. El navegador abre un HTML.
2. El HTML carga CSS.
3. El HTML carga api_IP.js.
4. El HTML carga script.js.
5. El HTML carga el JS especifico de esa pantalla.
6. El JS especifico busca elementos del DOM.
7. Hace peticiones al backend.
8. Recibe JSON.
9. Pinta el resultado en pantalla.
```

Ejemplo con pelicula:

```text
pelicula.html?id=25
  -> carga pelicula.js
  -> pelicula.js lee el id 25 de la URL
  -> pide GET /api/contenidos/25
  -> backend devuelve los datos
  -> pelicula.js pinta la ficha
```

## 5. HTML, CSS y JS por pantalla

Cada pantalla tiene tres partes:

```text
HTML -> donde van los contenedores
CSS  -> como se ven
JS   -> que datos se cargan y que ocurre al hacer clic
```

Ejemplo:

```text
peliculas.html
peliculas.css
peliculas.js
```

El HTML no tiene todas las peliculas escritas a mano. Normalmente tiene un contenedor vacio.

Luego el JS hace esto:

```text
Pide datos
  -> crea HTML con esos datos
  -> lo mete dentro del contenedor
```

## 6. Estado guardado en el navegador

El frontend guarda informacion en el navegador para recordar la sesion.

### `localStorage`

Se mantiene aunque cierres la pestana.

Claves importantes:

```text
JAM_user
```

Guarda el usuario logueado: email, plan, tipo de usuario, si esta activo, etc.

```text
JAM_profile
```

Guarda el perfil activo: id de cuenta, nombre de perfil y avatar.

```text
JAM_token
```

Esta preparado para token, aunque en el proyecto normalmente no es la parte principal.

### `sessionStorage`

Se borra al cerrar la pestana.

Claves importantes:

```text
planSeleccionado
```

Guarda el plan elegido antes de pagar.

```text
JAM_profile_onboarding
```

Marca que despues de registrarse o pagar hay que crear/seleccionar perfil.

## 7. Flujo de login y perfiles

Archivos principales:

```text
landing.html
landing.js
perfiles.html
perfiles.js
```

Flujo:

```text
Usuario inicia sesion
  -> landing.js valida email y password con backend
  -> guarda JAM_user en localStorage
  -> manda a perfiles.html
  -> perfiles.js carga las cuentas/perfiles del usuario
  -> usuario elige perfil
  -> se guarda JAM_profile
  -> ya puede entrar a la web
```

La diferencia importante:

```text
Usuario = email y plan
Perfil/Cuenta = quien esta viendo contenido dentro de ese usuario
```

Un usuario puede tener varios perfiles segun su plan.

## 8. Pagina de inicio

Archivos:

```text
index.html
index.js
index.css
```

La home muestra contenido destacado y secciones de catalogo.

Normalmente hace peticiones como:

```text
/api/contenidos/top/votados
/api/contenidos/top/puntos
/api/contenidos/top/recientes
```

Luego pinta:

- Hero.
- Carruseles.
- Cards.
- Tickers o secciones visuales.

La home es una pantalla de descubrimiento general.

## 9. Peliculas y series

Archivos:

```text
peliculas.html
peliculas.js
peliculas.css

series.html
series.js
series.css
```

Ambas usan:

```text
catalog-discovery.js
```

La diferencia principal es el filtro:

```text
PELICULA
SERIE
```

Flujo de peliculas:

```text
Usuario abre peliculas.html
  -> peliculas.js configura el catalogo para tipo PELICULA
  -> catalog-discovery.js pide datos al backend
  -> se pintan cards de peliculas
```

Flujo de series:

```text
Usuario abre series.html
  -> series.js configura el catalogo para tipo SERIE
  -> catalog-discovery.js pide datos al backend
  -> se pintan cards de series
```

Cuando se busca:

```text
Usuario escribe en el buscador
  -> JS espera un poco para no pedir en cada milisegundo
  -> llama a /api/contenidos/buscar
  -> backend devuelve resultados
  -> se actualiza el grid
```

Eso se llama normalmente debounce: esperar un momento antes de lanzar la busqueda.

## 10. Explorar

Archivos:

```text
explorar.html
explorar.js
explorar.css
```

Explorar es mas general que peliculas o series.

Permite buscar:

- Peliculas.
- Series.
- Trabajadores.

Flujo:

```text
Usuario escribe un nombre
  -> explorar.js busca contenidos
  -> tambien busca trabajadores por nombre
  -> junta resultados
  -> pinta cards de contenido y cards de trabajador
```

Endpoints importantes:

```text
/api/contenidos/buscar
/api/trabajadores/buscar
```

En esta pantalla los trabajadores tienen su propia card, pero visualmente se intenta mantener el mismo tamano que las cards de contenido para que todo se vea ordenado.

## 11. Categorias

Archivos:

```text
categoria.html
categoria.js
```

La categoria se lee desde la URL.

Ejemplo:

```text
categoria.html?categoria=Accion
```

Flujo:

```text
categoria.js lee el nombre de la categoria
  -> llama a /api/contenidos/categoria/{categoria}
  -> backend devuelve contenidos de esa categoria
  -> el frontend pinta las cards
```

Lo importante:

```text
Categoria no guarda peliculas dentro directamente.
La relacion esta en SQL.
```

El frontend solo pide "dame contenidos de esta categoria".

## 12. Detalle de pelicula

Archivos:

```text
pelicula.html
pelicula.js
pelicula.css
```

La pelicula se abre con un id en la URL.

Ejemplo:

```text
pelicula.html?id=12
```

Flujo:

```text
pelicula.js lee id=12
  -> pide /api/contenidos/12
  -> pinta titulo, imagen, descripcion, fecha, nota, trailer, categorias
  -> pide o muestra trabajadores relacionados
  -> activa boton de guardar en lista
  -> activa bloque de resenas
  -> carga recomendaciones
```

Aqui se juntan muchos modulos:

```text
pelicula.js       -> ficha principal
resena.js         -> resenas
listas-widget.js  -> guardar en listas
trabajador-links.js -> enlaces a directores/actores
script.js         -> helpers y componentes comunes
```

## 13. Detalle de serie

Archivos:

```text
serie.html
serie.js
serie.css
```

Funciona parecido a pelicula, pero con una diferencia:

```text
Una serie tiene temporadas y episodios.
```

Flujo:

```text
serie.js lee el id de la URL
  -> pide /api/contenidos/{id}
  -> pide /api/episodios/serie/{id}
  -> agrupa episodios por temporada
  -> pinta el selector de temporadas/episodios
```

Tambien puede usar:

- Resenas.
- Guardar en listas.
- Trabajadores.
- Recomendaciones.

## 14. Trabajador

Archivos:

```text
trabajador.html
trabajador.js
```

Se abre asi:

```text
trabajador.html?id=5
```

Flujo:

```text
trabajador.js lee id=5
  -> pide /api/trabajadores/5
  -> pide /api/trabajadores/5/filmografia
  -> pinta el perfil del trabajador
  -> pinta sus peliculas/series como cards
```

La filmografia es simplemente la lista de contenidos donde ese trabajador aparece como director o actor.

## 15. Resenas en el frontend

Archivo:

```text
resena.js
```

El bloque de resenas necesita saber:

```text
idContenido
idCuenta del perfil activo
```

Flujo para ver resenas:

```text
resena.js recibe idContenido
  -> pide /api/resenas/contenido/{idContenido}
  -> pide /api/resenas/contenido/{idContenido}/media
  -> pinta opiniones y media
```

Flujo para crear resena:

```text
Usuario escribe texto y puntuacion
  -> resena.js comprueba perfil activo
  -> manda POST /api/resenas
  -> backend guarda la resena
  -> se vuelve a pintar el bloque
```

## 16. Listas en el frontend

Archivos:

```text
listas.html
listas.js
listas-widget.js
```

Hay dos usos:

```text
listas.html
```

Sirve para gestionar listas completas.

```text
listas-widget.js
```

Sirve para guardar una pelicula o serie desde su detalle.

Flujo de guardar:

```text
Usuario pulsa guardar
  -> se comprueba el perfil activo
  -> se cargan sus listas
  -> usuario elige una lista
  -> se llama a /api/listas/{idLista}/contenidos/{idContenido}
```

## 17. Planes, pago y cuenta

Archivos:

```text
planes.html
planes.js
pago.html
pago.js
cuenta.html
cuenta.js
```

Flujo resumido:

```text
Usuario elige plan
  -> se guarda planSeleccionado en sessionStorage
  -> va a pago.html
  -> pago.js registra el pago en backend
  -> backend actualiza el plan del usuario
  -> el frontend refresca JAM_user
```

La cuenta sirve para:

- Ver datos del usuario.
- Ver plan.
- Ver perfiles.
- Modificar datos.
- Cerrar sesion.

## 18. Dashboard admin

Archivos:

```text
dashboard.html
dashboard-script.js
dashboard-styles.css
```

Es la parte de administracion.

Permite gestionar o consultar:

- Usuarios.
- Planes.
- Pagos.
- Cuentas.

El dashboard llama endpoints de administracion o endpoints generales, pero solo deberia usarse si el usuario tiene rol `ADMIN`.

## 19. Como se pinta una card

Muchas paginas no escriben cards a mano.

Usan funciones comunes de `script.js`, por ejemplo:

```text
window.JAM.buildCatalogCard()
```

La card recibe datos como:

- Titulo.
- Imagen.
- Tipo.
- Ano.
- Director.
- Id del contenido.

Y devuelve HTML.

Luego el JS hace:

```text
contenedor.innerHTML = cards.join('')
```

La ventaja:

```text
Si todas las paginas usan la misma funcion de card,
la web mantiene el mismo diseno.
```

## 20. Como explicar el frontend sin liarte

Puedes usar esta frase:

> El frontend no guarda los datos principales. Lo que hace es pedirlos al backend, recibirlos como JSON y pintarlos en la pagina. Cada pantalla tiene su HTML, su CSS y su JavaScript, y los elementos comunes como cards, header, resenas o listas se reutilizan con scripts compartidos.

## 21. Errores tipicos que debes entender

### La pagina no carga datos

Puede ser por:

- `API_BASE` apunta a una IP incorrecta.
- El backend no esta encendido.
- El endpoint no existe.
- La base de datos no tiene datos.

### Sale la pagina pero sin usuario

Puede faltar:

```text
JAM_user
JAM_profile
```

en `localStorage`.

### Las resenas o listas no funcionan

Normalmente necesitan perfil activo:

```text
JAM_profile.idCuenta
```

Sin cuenta/perfil, el frontend no sabe a nombre de quien guardar.

### Un detalle no abre

Puede faltar el id en la URL:

```text
pelicula.html?id=12
```

Sin id, el JS no sabe que contenido pedir.

## 22. Resumen final

El frontend funciona asi:

```text
HTML prepara contenedores
CSS da estilo
JS lee usuario, URL y eventos
JS llama al backend con fetch
Backend devuelve JSON
JS convierte JSON en HTML
Usuario interactua con la pagina
```

Esa es la base para entender casi cualquier pantalla del proyecto.
