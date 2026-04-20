import requests
import json
import random

# ============================================================
# CONFIGURACIÓN
# ============================================================

BASE_URL = "https://api.imdbapi.dev/titles"
CANTIDAD = 20000

GENEROS_ES = {
    "Action": "Acción",
    "Adventure": "Aventura",
    "Animation": "Animación",
    "Biography": "Biografía",
    "Comedy": "Comedia",
    "Crime": "Crimen",
    "Documentary": "Documental",
    "Drama": "Drama",
    "Family": "Familia",
    "Fantasy": "Fantasía",
    "Film-Noir": "Cine Negro",
    "History": "Historia",
    "Horror": "Terror",
    "Music": "Música",
    "Musical": "Musical",
    "Mystery": "Misterio",
    "Romance": "Romance",
    "Sci-Fi": "Ciencia Ficción",
    "Sport": "Deporte",
    "Thriller": "Suspense",
    "War": "Guerra",
    "Western": "Western"
}

# ============================================================
# HELPERS
# ============================================================

def leer_ids_desde_txt(ruta):
    with open(ruta, "r", encoding="utf-8") as f:
        return [linea.strip() for linea in f if linea.strip()]

def escapar(texto):
    if texto is None:
        return "NULL"
    texto = str(texto).replace("'", "''")
    return f"'{texto}'"

def fecha_desde_anio(anio):
    if anio is None:
        return "NULL"
    return f"'{anio}-01-01'"

def duracion_minutos(segundos):
    if segundos is None:
        return 0
    return segundos // 60

def tipo_contenido(tipo):
    if tipo and tipo.lower() == "tvseries":
        return "SERIE"
    return "PELICULA"

# ============================================================
# GENERADOR DE SQL
# ============================================================

def generar_sql(data):
    bloques = []
    bloques.append(f"-- ============================================================")
    bloques.append(f"-- {data.get('primaryTitle', 'SIN TÍTULO')} ({data.get('id')})")
    bloques.append(f"-- ============================================================")

    directores = data.get("directors", [])
    if directores:
        director = directores[0]
        bloques.append(f"\n-- Director")
        bloques.append(
            f"INSERT IGNORE INTO Trabajadores (id_api, nombre) VALUES "
            f"({escapar(director['id'])}, {escapar(director['displayName'])});"
        )

    actores = data.get("stars", [])
    if actores:
        bloques.append(f"\n-- Actores")
        for actor in actores:
            bloques.append(
                f"INSERT IGNORE INTO Trabajadores (id_api, nombre) VALUES "
                f"({escapar(actor['id'])}, {escapar(actor['displayName'])});"
            )

    generos = data.get("genres", [])
    if generos:
        bloques.append(f"\n-- Categorías")
        for genero in generos:
            nombre_es = GENEROS_ES.get(genero, genero)
            bloques.append(
                f"INSERT IGNORE INTO Categoria (nombreCategoria) VALUES ({escapar(nombre_es)});"
            )

    id_api      = data.get("id")
    titulo      = data.get("primaryTitle")
    descripcion = data.get("plot")
    fecha       = fecha_desde_anio(data.get("startYear"))
    imagen      = data.get("primaryImage", {}).get("url")
    tipo        = tipo_contenido(data.get("type"))

    director_subquery = "NULL"
    if directores:
        director_subquery = f"(SELECT id_trabajador FROM Trabajadores WHERE id_api = {escapar(directores[0]['id'])})"

    bloques.append(f"\n-- Contenido")
    bloques.append(
        f"INSERT IGNORE INTO Contenido "
        f"(id_api, titulo_principal, id_director, tipo_contenido, descripcion, fecha, imagen_url) VALUES ("
        f"{escapar(id_api)}, "
        f"{escapar(titulo)}, "
        f"{director_subquery}, "
        f"'{tipo}', "
        f"{escapar(descripcion)}, "
        f"{fecha}, "
        f"{escapar(imagen)}"
        f");"
    )

    contenido_subquery = f"(SELECT id_contenido FROM Contenido WHERE id_api = {escapar(id_api)})"

    if tipo == "PELICULA":
        duracion = duracion_minutos(data.get("runtimeSeconds"))
        bloques.append(f"\n-- Pelicula")
        bloques.append(
            f"INSERT IGNORE INTO Pelicula (id_contenido, duracion) VALUES "
            f"({contenido_subquery}, {duracion});"
        )
    else:
        bloques.append(f"\n-- Serie")
        bloques.append(
            f"INSERT IGNORE INTO Serie (id_contenido) VALUES "
            f"({contenido_subquery});"
        )

    if actores:
        bloques.append(f"\n-- ActorParticipa")
        for actor in actores:
            trabajador_subquery = f"(SELECT id_trabajador FROM Trabajadores WHERE id_api = {escapar(actor['id'])})"
            bloques.append(
                f"INSERT IGNORE INTO ActorParticipa (id_contenido, id_trabajador) VALUES "
                f"({contenido_subquery}, {trabajador_subquery});"
            )

    if generos:
        bloques.append(f"\n-- ContenidoPerteneceACategoria")
        for genero in generos:
            nombre_es = GENEROS_ES.get(genero, genero)
            bloques.append(
                f"INSERT IGNORE INTO ContenidoPerteneceACategoria (id_contenido, nombreCategoria) VALUES "
                f"({contenido_subquery}, {escapar(nombre_es)});"
            )

    return "\n".join(bloques)

# ============================================================
# MAIN
# ============================================================

from concurrent.futures import ThreadPoolExecutor, as_completed

def procesar_id(id_titulo):
    try:
        response = requests.get(f"{BASE_URL}/{id_titulo}", timeout=10)

        if response.status_code != 200:
            return None, f"⚠️  {id_titulo} — HTTP {response.status_code}"

        data = response.json()

        if not data.get("primaryTitle"):
            return None, f"⚠️  {id_titulo} — sin datos útiles"

        return generar_sql(data), f"✅ {data.get('primaryTitle')}"

    except Exception as e:
        return None, f"❌ {id_titulo} — {e}"


def main():
    ids = leer_ids_desde_txt(CANTIDAD)
    todos_los_bloques = []
    procesados = 0
    fallidos = 0

    with ThreadPoolExecutor(max_workers=60) as executor:
        futuros = {executor.submit(procesar_id, id_titulo): id_titulo for id_titulo in ids}

        for futuro in as_completed(futuros):
            sql, mensaje = futuro.result()
            print(mensaje)

            if sql:
                todos_los_bloques.append(sql)
                procesados += 1
                print(f"{mensaje} — ✅ {procesados} procesados / ❌ {fallidos} fallidos")
            else:
                fallidos += 1
                print(f"{mensaje} — ✅ {procesados} procesados / ❌ {fallidos} fallidos")

    sql_final = "\n\n".join(todos_los_bloques)

    with open("output.sql", "w", encoding="utf-8") as f:
        f.write("USE JAMAJO_DDBB;\n\n")
        f.write(sql_final)

    print(f"\n✅ Generado output.sql")
    print(f"   Procesados: {procesados}")
    print(f"   Fallidos/inexistentes: {fallidos}")


if __name__ == "__main__":
    main()