Endpoints del backend


# /api/contenidos

GET /api/contenidos/{id} -> Devuelve un contenido por su ID. Si es película incluye duración. Incluye array de categorías.
GET /api/contenidos/{id}/actores -> Devuelve los actores de un contenido
GET /api/contenidos/{id}/recomendados -> Devuelve ~12 contenidos recomendados basados en director, categorías, época y título
GET /api/contenidos/contar -> Devuelve el total de contenido, películas y series
GET /api/contenidos/top/votados -> Top 18 contenidos con más votos
GET /api/contenidos/top/puntos -> Top 18 contenidos mejor puntuados
GET /api/contenidos/top/recientes -> Top 18 contenidos más recientes
GET /api/contenidos/top/largas -> Top 18 películas más largas
POST /api/contenidos/top/por-nombres -> Devuelve contenidos cuyo título coincida con una lista de nombres enviada en el body
GET /api/contenidos/buscar?q=&tipo=&orden=&dir=&page= -> Búsqueda por título con paginación de 24, filtro por tipo y ordenación
GET /api/contenidos/por-categorias?categorias=&tipo=&orden=&dir=&page= -> Búsqueda por categorías (AND exclusivo: solo contenidos con todas las categorías indicadas), paginación de 49
GET /api/contenidos/categoria/{nombreCategoria}?page= -> Devuelve contenidos de una categoría ordenados por votos DESC, paginación de 49
POST /api/contenidos -> Crea un nuevo contenido (no se usa)
PUT /api/contenidos/{id} -> Actualiza un contenido existente (no se usa)
DELETE /api/contenidos/{id} -> Elimina un contenido (no se usa)


# /api/episodios

GET /api/episodios/serie/{idContenido} -> Devuelve todos los episodios de una serie ordenados por temporada y episodio
GET /api/episodios/contenido/{idContenido}/temporada/{nTemporada}/episodio/{nEpisodio} -> Devuelve un episodio concreto (idContenido = id del contenido en BD)


# /api/trabajadores

GET /api/trabajadores -> Devuelve todos los actores y directores (no usar, genérico)
GET /api/trabajadores/buscar?q=&limit= -> Busca trabajadores por nombre y devuelve hasta `limit` coincidencias
GET /api/trabajadores/{id} -> Devuelve un trabajador por su ID
GET /api/trabajadores/{id}/filmografia -> Devuelve todas las producciones en las que ha participado un trabajador (así podemos mostrar todas las películas de un actor)


# /api/usuarios

GET /api/usuarios -> Devuelve todos los usuarios
GET /api/usuarios/{email} -> Devuelve un usuario por su email (PK)
GET /api/usuarios/{email}/{password} -> Devuelve booleano si la password es correcta
POST /api/usuarios -> Crea un nuevo usuario y su cuenta principal (se le asigna el plan GRATIS automáticamente)
PUT /api/usuarios/{email} -> Actualiza campos del usuario: enabled, password o tipoUsuario (los campos son opcionales entre sí)
DELETE /api/usuarios/{email} -> Deshabilita un usuario (enabled = 0, no borra el registro para conservar listas, pagos, etc.)
POST /api/usuarios/{email}/solicitar-recuperacion -> Genera un código de 6 dígitos, lo guarda en BD con expiración de 15 minutos y lo envía al email indicado
POST /api/usuarios/{email}/validar-token -> Valida el código recibido. Body: `{"token": 123456}`. Devuelve 200 si es válido o 400 si es inválido o expirado
POST /api/usuarios/{email}/confirmar-pago -> Envía un correo de confirmación de pago al cliente. Body: `{ "plan": "PRO" }`
POST /api/usuarios/solicitar-verificacion -> Envía un código de 6 dígitos al email indicado para verificarlo antes del registro. Body: `{ "email": "..." }`
POST /api/usuarios/verificar-email -> Valida el código de verificación de registro. Body: `{ "email": "...", "token": 123456 }`. Devuelve 200 si es válido o 400 si es inválido o expirado

# /api/cuentas

GET /api/cuentas/{email} -> Devuelve todas las cuentas de un usuario
GET /api/cuentas/id/{idCuenta} -> Devuelve los datos de una cuenta por su ID
POST /api/cuentas/{email} -> Crea una cuenta adicional (valida el límite según el plan: GRATIS=1, ANUNCIOS=2, ESTANDAR=4, PRO=6)
PUT /api/cuentas/{idCuenta} -> Actualiza el username o el avatar (idFoto) de una cuenta
DELETE /api/cuentas/{idCuenta}?password= -> Elimina una cuenta (requiere la contraseña del usuario)

# /api/planes

(Estos planes son bastante estáticos así que no tienen demasiados métodos)
GET /api/planes -> Devuelve todos los planes de suscripción disponibles
GET /api/planes/{nombrePlan} -> Devuelve un plan por su nombre
PUT /api/planes/{nombrePlan} -> Actualiza el precio de un plan


# /api/pagos

GET /api/pagos -> Devuelve todos los pagos (no usar en frontend)
GET /api/pagos/{email} -> Devuelve el historial de pagos de un usuario
POST /api/pagos/{email} -> Registra un nuevo pago y actualiza el plan activo del usuario


# /api/listas

(Las listas pertenecen a cuentas, no a usuarios directamente. Se identifican por idCuenta)
GET /api/listas/cuenta/{idCuenta} -> Devuelve todas las listas de una cuenta
GET /api/listas/cuenta/{idCuenta}/contar -> Devuelve el número de listas de una cuenta
GET /api/listas/{idLista}/contenidos -> Devuelve los contenidos de una lista concreta
POST /api/listas/cuenta/{idCuenta} -> Crea una nueva lista para esa cuenta
PUT /api/listas/{idLista} -> Renombra una lista
DELETE /api/listas/{idLista} -> Elimina una lista y todos sus contenidos asociados
POST /api/listas/{idLista}/contenidos/{idContenido} -> Añade un contenido a una lista (devuelve error si ya existe)
DELETE /api/listas/{idLista}/contenidos/{idContenido} -> Quita un contenido de una lista


# /api/tmdb

(Estos métodos utilizan varios DTOs para filtrar los datos ya que las llamadas a TMDB devuelven muchas cosas que no necesitamos)
GET /api/tmdb/{id}/movieImages -> Devuelve imágenes de una película desde la API de TMDB
GET /api/tmdb/{id}/serieImages -> Devuelve imágenes de una serie desde la API de TMDB
GET /api/tmdb/{tvId}/season/{season}/episode/{episode}/images -> Devuelve la imagen de un episodio concreto desde TMDB

# /api/resenas

GET /api/resenas/cuenta/{idCuenta} -> Devuelve todas las reseñas de una cuenta
GET /api/resenas/contenido/{idContenido} -> Devuelve todas las reseñas de un contenido
GET /api/resenas/contenido/{idContenido}/media -> Devuelve la puntuación media de un contenido
POST /api/resenas -> Crea una nueva reseña. Body: `{ "idCuenta": 1, "idContenido": 1, "texto": "...", "puntuacion": 5 }`. Devuelve error si la cuenta ya tiene una reseña para ese contenido
PUT /api/resenas/{idResena}?idCuenta= -> Modifica texto y/o puntuacion de una reseña. Solo puede hacerlo la cuenta creadora. Body: `{ "texto": "...", "puntuacion": 3 }`
DELETE /api/resenas/{idResena}?idCuenta= -> Elimina una reseña. Solo puede hacerlo la cuenta creadora o una cuenta con rol ADMIN
