# Guia sencilla para la presentacion

Esta guia esta hecha para explicar tu parte de forma clara, dinamica y sin liarte con demasiados datos tecnicos.

El recorrido que vas a ensenar es este:

```text
Peliculas -> Series -> Explorar -> Categorias -> Pelicula de una categoria -> Detalle de pelicula
```

Y dentro de la pelicula explicas lo importante:

```text
Detalle -> Ver pelicula/anuncio -> Anadir a lista -> Resenas -> Trabajadores
```

La idea principal es que parezca una demo de usuario real: ensenas como alguien navega por la pagina, encuentra contenido, entra a una pelicula y puede interactuar con ella.

## Objetivo de mi parte

Puedes empezar con algo asi:

> En mi parte voy a explicar el recorrido de navegacion del catalogo. Primero vemos las pantallas de peliculas y series, despues la parte de explorar, luego filtramos por categorias y terminamos entrando a una pelicula concreta, donde se ve todo el detalle: verla, el anuncio, anadirla a una lista, escribir resenas y entrar en los trabajadores relacionados.

No hace falta empezar hablando de codigo. Primero explicas la experiencia del usuario.

## Estructura recomendada

### 1. Peliculas

Que ensenas:

- La pagina de peliculas.
- El buscador.
- Las cards de contenido.
- Los carruseles de descubrimiento.
- Que todo lo que aparece aqui esta filtrado para mostrar solo peliculas.

Que puedes decir:

> Esta pantalla esta pensada para que el usuario encuentre peliculas rapidamente. Tiene un buscador, secciones tipo carrusel y cards con la informacion basica de cada pelicula. Si el usuario pulsa una card, entra al detalle de esa pelicula.

Parte tecnica sencilla:

> Tecnicamente, el front pide al backend contenido de tipo pelicula. El backend consulta la base de datos y devuelve los datos preparados para que el JavaScript los pinte en pantalla.

No te metas a explicar cada linea del JavaScript. Con eso basta.

## 2. Series

Que ensenas:

- La pagina de series.
- Que visualmente funciona igual que peliculas.
- Que tambien tiene buscador, carruseles y cards.
- Que la diferencia es que aqui el contenido esta filtrado como serie.

Que puedes decir:

> La pantalla de series sigue la misma logica que peliculas. Esto hace que el usuario no tenga que aprender una interfaz nueva: cambia el tipo de contenido, pero la forma de navegar es la misma.

Parte tecnica sencilla:

> Se reutiliza la misma idea de catalogo: pedir datos al backend, recibir una lista y pintar las cards. Lo que cambia es el filtro de tipo de contenido.

## 3. Explorar

Que ensenas:

- El hero de explorar.
- El buscador general.
- Las cards de peliculas, series y trabajadores.
- Los carruseles de contenido.
- Los carruseles de trabajadores, como directores y actores.

Que puedes decir:

> Explorar es una pantalla mas general. Aqui no solo se buscan peliculas o series, tambien se pueden encontrar trabajadores, como actores o directores. La idea es que sea una entrada rapida a cualquier parte del catalogo.

Parte tecnica sencilla:

> Cuando el usuario escribe en el buscador, se hacen busquedas por nombre. Si coincide con contenido, se muestra como pelicula o serie. Si coincide con un trabajador, se muestra con una card propia y se puede entrar a su perfil.

Si quieres remarcar la mejora que hiciste:

> Tambien se cuido que las cards mantengan el mismo tamano para que la pagina no salte ni cambie de forma mientras se busca.

## 4. Categorias

Que ensenas:

- La pantalla de categorias.
- Las categorias disponibles.
- Que al pulsar una categoria se muestran contenidos relacionados.
- Aqui debes elegir una pelicula de esa categoria para continuar la demo.

Que puedes decir:

> Las categorias sirven para que el usuario no dependa solo del buscador. Puede entrar por genero o tipo de contenido y descubrir peliculas relacionadas con esa categoria.

Parte tecnica sencilla:

> Al seleccionar una categoria, el front pide al backend los contenidos asociados a esa categoria. La relacion viene de la base de datos, donde un contenido puede pertenecer a una o varias categorias.

Importante para tu orden:

> Despues de categorias, entro en una pelicula concreta de esa categoria. A partir de ahi explico toda la parte de detalle.

## 5. Pelicula de una categoria

Esta es la parte central de tu presentacion.

Aqui ya no estas explicando una lista, sino la ficha completa de una pelicula.

Que ensenas:

- Imagen o portada de la pelicula.
- Titulo.
- Datos principales.
- Categorias.
- Director.
- Actores.
- Boton para verla.
- Anuncio antes de verla.
- Opcion de anadir a lista.
- Resenas.
- Acceso a trabajadores.

Frase para entrar:

> Ahora, desde una categoria, entro en una pelicula concreta. Esta pagina es importante porque junta casi todas las funcionalidades del catalogo: informacion, reproduccion, listas, resenas y trabajadores.

## 6. Detalle de pelicula

Que ensenas primero:

- La informacion principal de la pelicula.
- Que el usuario sabe donde esta, que pelicula es y que puede hacer con ella.
- Los datos visibles sin explicar demasiadas tablas.

Que puedes decir:

> El detalle de pelicula funciona como la ficha principal del contenido. Aqui el usuario ve la informacion mas importante y desde aqui puede decidir si quiere verla, guardarla o mirar opiniones.

Parte tecnica sencilla:

> Esta pantalla carga la pelicula por su id. Ese id se pasa en la URL y el JavaScript lo usa para pedir al backend los datos de esa pelicula concreta.

Esto es suficiente. No necesitas explicar todos los campos.

## 7. Ver pelicula y anuncio

Que ensenas:

- El boton de ver pelicula.
- Que antes de acceder al contenido aparece el anuncio.
- Despues se puede continuar para ver la pelicula.

Que puedes decir:

> Al pulsar para ver la pelicula, primero se muestra el anuncio. Esto simula una plataforma real donde antes del contenido puede haber publicidad. Despues del anuncio, el usuario puede acceder a la reproduccion.

Parte tecnica sencilla:

> A nivel de funcionamiento, el boton lleva al flujo de visualizacion. La pagina controla primero el paso del anuncio y luego permite continuar con el contenido.

No hace falta explicar codigo del reproductor salvo que te pregunten.

## 8. Anadir a lista

Que ensenas:

- La opcion de guardar o anadir a una lista.
- Que sirve para que el usuario organice contenido.

Que puedes decir:

> Otra funcion importante es poder anadir la pelicula a una lista. Esto permite que el usuario guarde contenido para verlo despues o tenerlo organizado.

Parte tecnica sencilla:

> Para guardar la pelicula se relaciona el usuario, la lista y el contenido. Es una relacion sencilla: una lista puede tener muchos contenidos.

## 9. Resenas

Que ensenas:

- Las resenas de la pelicula.
- La media o valoracion si aparece.
- Que el usuario puede opinar.
- Que las opiniones pertenecen a una pelicula concreta.

Que puedes decir:

> En la parte de resenas, los usuarios pueden ver opiniones de otras personas y tambien dejar la suya. Esto hace que la ficha de la pelicula no sea solo informacion estatica, sino que tenga participacion de usuarios.

Parte tecnica sencilla:

> Las resenas se cargan usando el id de la pelicula. Asi el backend sabe que opiniones corresponden a este contenido y no a otro.

Si te preguntan por SQL:

> En base de datos, cada resena esta relacionada con un usuario y con un contenido.

## 10. Trabajadores

Que ensenas:

- Director.
- Actores.
- Que se puede hacer clic en ellos.
- La pagina de trabajador.
- Su filmografia.

Que puedes decir:

> Desde la pelicula tambien se puede navegar a los trabajadores relacionados, por ejemplo el director o los actores. Al pulsar en uno, entramos a su ficha y vemos su filmografia, es decir, los contenidos en los que participa.

Parte tecnica sencilla:

> Esto funciona porque las peliculas estan relacionadas con trabajadores. El backend puede devolver los actores de una pelicula, el director y tambien la filmografia de cada trabajador.

No hace falta explicar todas las tablas intermedias en detalle. Si quieres decirlo de forma simple:

> Hay una relacion entre contenido y trabajadores para saber quien participa en cada pelicula o serie.

## 11. Cierre de tu demo

Puedes cerrar con esto:

> Con esto se completa el recorrido principal: el usuario puede descubrir contenido desde peliculas, series, explorar o categorias, entrar en una pelicula concreta y desde ahi interactuar con ella: verla, guardarla, opinar y navegar hacia los trabajadores relacionados.

## Guion corto para memorizar

Si quieres algo mas directo para practicar, puedes seguir este orden:

1. Entro en peliculas y explico que es el catalogo filtrado por peliculas.
2. Entro en series y explico que sigue la misma logica, pero con series.
3. Entro en explorar y explico que es la busqueda general de contenido y trabajadores.
4. Entro en categorias y explico que sirve para descubrir contenido por tema.
5. Pulso una pelicula dentro de una categoria.
6. En la pelicula explico la ficha de detalle.
7. Pulso ver pelicula y explico el anuncio.
8. Explico anadir a lista.
9. Explico resenas.
10. Pulso un trabajador y explico la filmografia.

## Nivel tecnico recomendado

Usa esta regla:

```text
Primero digo que ve el usuario.
Despues digo, en una frase, como se conecta tecnicamente.
Y sigo con la demo.
```

Ejemplo:

> El usuario ve las peliculas de esta categoria. Tecnicamente, el front pide al backend los contenidos que pertenecen a esa categoria y los pinta como cards.

Eso esta bien. No hace falta abrir codigo ni explicar funciones internas salvo que el profesor lo pida.

## Mini explicacion tecnica global

Puedes usar esta parte si te preguntan como esta conectado todo:

> El front esta hecho con HTML, CSS y JavaScript. Las pantallas hacen peticiones al backend mediante endpoints. El backend recibe esas peticiones, consulta la base de datos SQL y devuelve la informacion en formato JSON. Luego el front usa esos datos para construir las cards, los detalles, las resenas y la informacion de trabajadores.

Esta frase te cubre front, back y SQL sin meterte en demasiada profundidad.

## Preguntas que pueden hacerte

### Como sabe la pagina que pelicula mostrar?

> Porque la pelicula tiene un id. Ese id viaja en la URL y el JavaScript lo usa para pedir al backend la informacion de esa pelicula.

### Como se filtra por categoria?

> Cada contenido esta relacionado con una o varias categorias. Cuando el usuario pulsa una categoria, el backend devuelve los contenidos que pertenecen a ella.

### Como aparecen los trabajadores?

> Los trabajadores estan relacionados con el contenido. Por eso en la pelicula se pueden mostrar director y actores, y desde ellos entrar a su filmografia.

### Como funcionan las resenas?

> Cada resena pertenece a un usuario y a un contenido. Por eso en la ficha de una pelicula solo aparecen las resenas de esa pelicula.

### Por que hay una pagina de explorar?

> Porque permite buscar de forma general. No obliga al usuario a saber si quiere una pelicula, una serie o un trabajador desde el principio.

## Que evitar

Evita hacer esto:

- Leer nombres de archivos uno por uno.
- Explicar todas las tablas SQL.
- Explicar funciones completas de JavaScript.
- Decir demasiados endpoints de memoria.
- Pararte demasiado tiempo en detalles tecnicos pequenos.

Mejor haz esto:

- Explica que problema resuelve cada pantalla.
- Ensena la interaccion en vivo.
- Di una frase tecnica corta por pantalla.
- Sigue avanzando por el recorrido.

## Version ultra corta por si te pones nervioso

> Mi parte ensena como el usuario descubre contenido. Primero puede entrar por peliculas o series, despues usar explorar para buscar contenido o trabajadores, y tambien filtrar por categorias. Desde una categoria entro a una pelicula concreta, y ahi explico la ficha completa: informacion, ver pelicula con anuncio, anadir a lista, resenas y trabajadores. Tecnicamente, el front pide datos al backend, el backend consulta SQL y devuelve la informacion para pintarla en la pagina.

Con esa frase tienes toda tu parte resumida.
