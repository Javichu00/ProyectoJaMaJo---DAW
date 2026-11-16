# Guía de lanzamiento del proyecto

## 1. Base de datos

Ejecuta los scripts SQL en este orden:

1. `ConstructorDeTablas`
2. `Populate_IMDB`
3. `Populate_TMDB`
4. `AltersIdSerie`
4. `indices`(opcional)

> **Importante:** los archivos Populate son muy pesados y no se pueden abrir como archivo desde MySQL Workbench. Hay que copiar el contenido y pegarlo directamente en el editor del Workbench.

Los scripts tardan varios minutos en ejecutarse. Puedes continuar con los siguientes pasos mientras tanto.

📁 `SQL\ConstructoresFuncionales`

---

## 2. Backend

Mientras se ejecutan los scripts, lanza el proyecto desde Spring Boot.

---

## 3. Frontend

Lanza el frontend, preferiblemente desde **Live Server**, aunque también funciona en local.

Los archivos de entrada son `index.html` o `landing.html`.

📁 `Front\codigo\html`

---

## 4. Conexión backend ↔ frontend

Edita el archivo `api_IP.js` y configura la IP correcta del backend.

📁 `Front\codigo\js\api_IP.js`