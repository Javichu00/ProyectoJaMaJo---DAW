import requests
import gzip
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

# ============================================================
# CONFIGURACIÓN
# ============================================================

BASE_URL           = "https://api.imdbapi.dev/titles"
TMDB_API_KEY       = "02a35226a05c1ea60897c1d52a692fdf"
TMDB_FIND_URL      = "https://api.themoviedb.org/3/find/{id_imdb}?api_key={key}&external_source=imdb_id"
TMDB_TRAILER_URL   = "https://api.themoviedb.org/3/{tipo}/{id_tmdb}/videos?api_key={key}"
TMDB_SERIE_URL     = "https://api.themoviedb.org/3/tv/{id_tmdb}?api_key={key}"
TMDB_TEMPORADA_URL = "https://api.themoviedb.org/3/tv/{id_tmdb}/season/{numero}?api_key={key}"
RATINGS_GZ         = "../../../title.ratings.tsv.gz"

WORKERS     = 10
IDS_ENTRADA = "ids_filtrados.txt"
OUTPUT_SQL  = "output.sql"
LIMPIO_SQL  = "limpio.sql"

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
# CARGAR RATINGS EN MEMORIA
# ============================================================

def cargar_ratings():
    if not os.path.exists(RATINGS_GZ):
        print(f"⚠️  No se encontró {RATINGS_GZ}, los ratings quedarán en NULL")
        return {}

    print("📂 Cargando ratings...")
    ratings = {}
    with gzip.open(RATINGS_GZ, "rt", encoding="utf-8") as f:
        next(f)
        for linea in f:
            campos = linea.strip().split("\t")
            ratings[campos[0]] = (float(campos[1]), int(campos[2]))
    print(f"✅ {len(ratings)} ratings cargados")
    return ratings

# ============================================================
# HELPERS
# ============================================================

def leer_ids(ruta):
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

def fecha_desde_string(fecha_str):
    if not fecha_str:
        return "NULL"
    return f"'{fecha_str}'"

def duracion_minutos(segundos):
    if segundos is None:
        return 0
    return segundos // 60

def tipo_contenido(tipo):
    if tipo is None:
        return None
    t = tipo.lower()
    if t == "tvseries":
        return "SERIE"
    if t == "movie":
        return "PELICULA"
    return None

# ============================================================
# OBTENER TRAILER + ID TMDB (una sola llamada find, reutilizable)
# ============================================================

def obtener_datos_tmdb(id_imdb):
    """
    Devuelve (trailer_url, id_tmdb, tipo_tmdb).
    Una sola llamada find para obtener el id_tmdb,
    que luego se reutiliza para temporadas sin repetir la búsqueda.
    """
    try:
        url_find = TMDB_FIND_URL.format(id_imdb=id_imdb, key=TMDB_API_KEY)
        r = requests.get(url_find, timeout=10)

        if r.status_code != 200:
            print(f"⚠️  {id_imdb} — TMDB find HTTP {r.status_code}")
            return None, None, None

        data = r.json()

        if data.get("movie_results"):
            id_tmdb   = data["movie_results"][0]["id"]
            tipo_tmdb = "movie"
        elif data.get("tv_results"):
            id_tmdb   = data["tv_results"][0]["id"]
            tipo_tmdb = "tv"
        else:
            print(f"⚠️  {id_imdb} — no encontrado en TMDB")
            return None, None, None

        # Buscar trailer
        url_videos  = TMDB_TRAILER_URL.format(tipo=tipo_tmdb, id_tmdb=id_tmdb, key=TMDB_API_KEY)
        r2          = requests.get(url_videos, timeout=10)
        trailer_url = None

        if r2.status_code == 200:
            videos = r2.json().get("results", [])
            if videos:
                trailer = next((v for v in videos if v.get("type") == "Trailer"), videos[0])
                if trailer.get("site") == "YouTube":
                    trailer_url = f"https://www.youtube.com/watch?v={trailer['key']}"

        return trailer_url, id_tmdb, tipo_tmdb

    except Exception as e:
        print(f"❌ {id_imdb} — error en TMDB: {e}")
        return None, None, None

# ============================================================
# OBTENER TEMPORADAS Y EPISODIOS
# ============================================================

def obtener_temporadas_sql(id_imdb, id_tmdb, serie_subquery):
    """
    Pide los detalles de la serie, itera temporadas (saltando season_number=0 = Specials)
    y por cada una pide sus episodios. Devuelve el bloque SQL completo.
    """
    bloques = []

    try:
        url_serie = TMDB_SERIE_URL.format(id_tmdb=id_tmdb, key=TMDB_API_KEY)
        r         = requests.get(url_serie, timeout=10)

        if r.status_code != 200:
            print(f"⚠️  {id_imdb} — TMDB serie detalles HTTP {r.status_code}")
            return ""

        seasons = r.json().get("seasons", [])

        for season in seasons:
            numero = season.get("season_number", 0)

            if numero == 0:
                continue  # Saltar Specials

            nombre_temp   = season.get("name")
            descripcion_t = season.get("overview") or None

            bloques.append(f"\n-- Temporada {numero}")
            bloques.append(
                f"INSERT IGNORE INTO Temporada (id_serie, numero_temporada, nombre, descripcion) VALUES ("
                f"{serie_subquery}, "
                f"{numero}, "
                f"{escapar(nombre_temp)}, "
                f"{escapar(descripcion_t)}"
                f");"
            )

            temporada_subquery = (
                f"(SELECT id_temporada FROM Temporada WHERE "
                f"id_serie = {serie_subquery} AND numero_temporada = {numero})"
            )

            # Episodios de esta temporada
            url_temp = TMDB_TEMPORADA_URL.format(id_tmdb=id_tmdb, numero=numero, key=TMDB_API_KEY)
            r2       = requests.get(url_temp, timeout=10)

            if r2.status_code != 200:
                print(f"⚠️  {id_imdb} T{numero} — TMDB temporada HTTP {r2.status_code}")
                continue

            episodios = r2.json().get("episodes", [])

            if episodios:
                bloques.append(f"\n-- Episodios T{numero}")
                for ep in episodios:
                    num_ep      = ep.get("episode_number")
                    titulo_ep   = ep.get("name")
                    desc_ep     = ep.get("overview") or None
                    duracion_ep = ep.get("runtime") or 0  # TMDB devuelve minutos directamente
                    fecha_ep    = fecha_desde_string(ep.get("air_date"))

                    bloques.append(
                        f"INSERT IGNORE INTO Episodio "
                        f"(id_temporada, numero_episodio, titulo, descripcion, duracion, fecha_emision) VALUES ("
                        f"{temporada_subquery}, "
                        f"{num_ep}, "
                        f"{escapar(titulo_ep)}, "
                        f"{escapar(desc_ep)}, "
                        f"{duracion_ep}, "
                        f"{fecha_ep}"
                        f");"
                    )

    except Exception as e:
        print(f"❌ {id_imdb} — error obteniendo temporadas: {e}")

    return "\n".join(bloques)

def generar_sql_limpio(input_file, output_file):
    seen = set()
    with open(input_file, "r", encoding="utf-8") as infile, open(output_file, "w", encoding="utf-8") as outfile:
        for line in infile:
            if line not in seen:
                outfile.write(line)
                seen.add(line)

# ============================================================
# GENERADOR DE SQL COMPLETO
# ============================================================

def generar_sql(data, ratings):
    tipo = tipo_contenido(data.get("type"))
    if tipo is None:
        return None  # episodio, omitir

    id_api = data.get("id")

    bloques = []
    bloques.append(f"-- ============================================================")
    bloques.append(f"-- {data.get('primaryTitle', 'SIN TÍTULO')} ({id_api})")
    bloques.append(f"-- ============================================================")

    # --- Director ---
    directores = data.get("directors", [])
    if directores:
        director = directores[0]
        bloques.append(f"\n-- Director")
        bloques.append(
            f"INSERT IGNORE INTO Trabajadores (id_api, nombre) VALUES "
            f"({escapar(director['id'])}, {escapar(director['displayName'])});"
        )

    # --- Actores ---
    actores = data.get("stars", [])
    if actores:
        bloques.append(f"\n-- Actores")
        for actor in actores:
            bloques.append(
                f"INSERT IGNORE INTO Trabajadores (id_api, nombre) VALUES "
                f"({escapar(actor['id'])}, {escapar(actor['displayName'])});"
            )

    generos = data.get("genres", [])

    # --- Contenido ---
    titulo      = data.get("primaryTitle")
    descripcion = data.get("plot")
    fecha       = fecha_desde_anio(data.get("startYear"))
    imagen      = data.get("primaryImage", {}).get("url")

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

    # --- Pelicula / Serie ---
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

    # --- ActorParticipa ---
    if actores:
        bloques.append(f"\n-- ActorParticipa")
        for actor in actores:
            trabajador_subquery = f"(SELECT id_trabajador FROM Trabajadores WHERE id_api = {escapar(actor['id'])})"
            bloques.append(
                f"INSERT IGNORE INTO ActorParticipa (id_contenido, id_trabajador) VALUES "
                f"({contenido_subquery}, {trabajador_subquery});"
            )

    # --- ContenidoPerteneceACategoria ---
    if generos:
        bloques.append(f"\n-- ContenidoPerteneceACategoria")
        for genero in generos:
            nombre_es = GENEROS_ES.get(genero, genero)
            bloques.append(
                f"INSERT IGNORE INTO ContenidoPerteneceACategoria (id_contenido, nombreCategoria) VALUES "
                f"({contenido_subquery}, {escapar(nombre_es)});"
            )

    # --- Una sola llamada TMDB: trailer + id_tmdb para reutilizar en temporadas ---
    nota = "NULL"
    n_votos = "NULL"

    if id_api in ratings:
        nota, n_votos = ratings[id_api]
        nota = str(nota)
        n_votos = str(n_votos)

    trailer_url, id_tmdb, tipo_tmdb = obtener_datos_tmdb(id_api)

    bloques.append(f"\n-- Rating y Trailer")
    bloques.append(
        f"UPDATE Contenido SET "
        f"id_tmdb = {id_tmdb if id_tmdb is not None else 'NULL'}, "
        f"nota = {nota}, "
        f"n_votos = {n_votos}, "
        f"trailer_url = {escapar(trailer_url)} "
        f"WHERE id_api = {escapar(id_api)};"
    )

    # --- Temporadas y Episodios (solo series) ---
    if tipo == "SERIE" and id_tmdb is not None:
        serie_subquery = f"(SELECT id_serie FROM Serie WHERE id_contenido = {contenido_subquery})"
        sql_temporadas = obtener_temporadas_sql(id_api, id_tmdb, serie_subquery)
        if sql_temporadas:
            bloques.append(sql_temporadas)

    return "\n".join(bloques)

# ============================================================
# PROCESAR ID
# ============================================================

def procesar_id(id_titulo, ratings, fichero_fallidos):
    try:
        response = requests.get(f"{BASE_URL}/{id_titulo}", timeout=10)

        if response.status_code == 429:
            with open(fichero_fallidos, "a", encoding="utf-8") as f:
                f.write(id_titulo + "\n")
            return None, f"⚠️  {id_titulo} — 429 guardado en {fichero_fallidos}"

        if response.status_code != 200:
            return None, f"⚠️  {id_titulo} — HTTP {response.status_code}"

        data = response.json()

        if not data.get("primaryTitle"):
            return None, f"⚠️  {id_titulo} — sin datos útiles"

        tipo_raw = data.get("type", "desconocido")
        sql = generar_sql(data, ratings)

        if sql is None:
            return None, f"⏭️  {id_titulo} — omitido (tipo: {tipo_raw})"

        return sql, f"✅ {data.get('primaryTitle')} ({tipo_raw})"

    except Exception as e:
        with open(fichero_fallidos, "a", encoding="utf-8") as f:
            f.write(id_titulo + "\n")
        return None, f"❌ {id_titulo} — {e}"

# ============================================================
# PROCESAR TANDA
# ============================================================

def procesar_tanda(ids, ratings, fichero_fallidos):
    procesados = 0
    fallidos   = 0

    if not os.path.exists(OUTPUT_SQL):
        with open(OUTPUT_SQL, "w", encoding="utf-8") as f:
            f.write("USE JAMAJO_DDBB;\n\n")

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futuros = {executor.submit(procesar_id, id_titulo, ratings, fichero_fallidos): id_titulo for id_titulo in ids}

        for futuro in as_completed(futuros):
            sql, mensaje = futuro.result()

            if sql:
                with open(OUTPUT_SQL, "a", encoding="utf-8") as f:
                    f.write("\n\n" + sql)
                procesados += 1
            else:
                fallidos += 1

            print(f"{mensaje} — ✅ {procesados} procesados / ❌ {fallidos} fallidos")

    return procesados, fallidos

# ============================================================
# MAIN
# ============================================================

def main():
    ratings          = cargar_ratings()
    ronda            = 1
    total_procesados = 0
    total_fallidos   = 0
    fichero_actual   = IDS_ENTRADA

    while True:
        if not os.path.exists(fichero_actual):
            print(f"✅ No existe {fichero_actual}, hemos terminado.")
            break

        ids = leer_ids(fichero_actual)

        if not ids:
            print(f"✅ {fichero_actual} está vacío, hemos terminado.")
            break

        fichero_fallidos = f"fallidos{ronda}.txt"
        print(f"\n🔁 Ronda {ronda} — leyendo {fichero_actual} ({len(ids)} IDs) — fallidos → {fichero_fallidos}")

        procesados, fallidos = procesar_tanda(ids, ratings, fichero_fallidos)
        total_procesados += procesados
        total_fallidos   += fallidos

        print(f"\n   Ronda {ronda} terminada — ✅ {procesados} procesados / ❌ {fallidos} fallidos")

        fichero_actual = fichero_fallidos
        ronda += 1

        if fallidos == 0:
            print(f"\n🎉 Sin fallidos en la ronda {ronda - 1}, proceso completado.")
            break

    print(f"\n{'='*50}")
    print(f"TOTAL procesados: {total_procesados}")
    print(f"TOTAL fallidos:   {total_fallidos}")
    print(f"Output:           {OUTPUT_SQL}")
    if os.path.exists(OUTPUT_SQL):
        generar_sql_limpio(OUTPUT_SQL, LIMPIO_SQL)
        print(f"Output limpio:    {LIMPIO_SQL}")

if __name__ == "__main__":
    main()