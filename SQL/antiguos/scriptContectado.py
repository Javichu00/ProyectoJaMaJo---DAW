import requests
import gzip
import os
import mysql.connector

# ============================================================
# CONFIG
# ============================================================

BASE_URL = "https://api.imdbapi.dev/titles"

TMDB_API_KEY = "TU_API_KEY"

TMDB_FIND_URL = "https://api.themoviedb.org/3/find/{id_imdb}?api_key={key}&external_source=imdb_id"
TMDB_TRAILER_URL = "https://api.themoviedb.org/3/{tipo}/{id_tmdb}/videos?api_key={key}"

RATINGS_GZ = "../../../title.ratings.tsv.gz"
IDS_ENTRADA = "ids_filtrados.txt"

FAILED_429_FILE = "429.txt"

COMMIT_BATCH = 1000

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
    "Horror": "Terror",
    "Mystery": "Misterio",
    "Romance": "Romance",
    "Sci-Fi": "Ciencia Ficción",
    "Thriller": "Suspense"
}

# ============================================================
# DB
# ============================================================

DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "AlumnoIFP",
    "database": "JAMAJO_DDBB"
}

conn = mysql.connector.connect(**DB_CONFIG)
cursor = conn.cursor()

# ============================================================
# ESTADÍSTICAS
# ============================================================

stats = {
    "ok": 0,
    "imdb_fail": 0,
    "tmdb_fail": 0,
    "notitle": 0,
    "429": 0
}

# ============================================================
# RATINGS
# ============================================================

def cargar_ratings():
    print("📂 Cargando ratings...")
    ratings = {}

    if not os.path.exists(RATINGS_GZ):
        return ratings

    with gzip.open(RATINGS_GZ, "rt", encoding="utf-8") as f:
        next(f)
        for line in f:
            parts = line.strip().split("\t")
            ratings[parts[0]] = (float(parts[1]), int(parts[2]))

    print(f"Ratings cargados: {len(ratings)}")
    return ratings

# ============================================================
# HELPERS
# ============================================================

def leer_ids(path):
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return [x.strip() for x in f if x.strip()]

def guardar_429(id_titulo):
    with open(FAILED_429_FILE, "a", encoding="utf-8") as f:
        f.write(id_titulo + "\n")

def limpiar_429():
    if os.path.exists(FAILED_429_FILE):
        os.remove(FAILED_429_FILE)

def fecha(anio):
    return f"{anio}-01-01" if anio else None

# ============================================================
# TMDB
# ============================================================

def obtener_tmdb(id_imdb):
    try:
        url = TMDB_FIND_URL.format(id_imdb=id_imdb, key=TMDB_API_KEY)
        r = requests.get(url, timeout=10)

        if r.status_code == 429:
            return "429", None

        data = r.json()

        if data.get("movie_results"):
            return data["movie_results"][0]["id"], "movie"
        if data.get("tv_results"):
            return data["tv_results"][0]["id"], "tv"

        return None, None

    except Exception as e:
        print(f"❌ TMDB error {id_imdb}: {e}")
        return None, None

def obtener_trailer(tipo, id_tmdb, id_imdb):
    if not id_tmdb:
        return None

    try:
        url = TMDB_TRAILER_URL.format(tipo=tipo, id_tmdb=id_tmdb, key=TMDB_API_KEY)
        r = requests.get(url, timeout=10)

        if r.status_code == 429:
            print(f"⚠️ TMDB 429 en trailer {id_imdb}")
            return None

        videos = r.json().get("results", [])

        for v in videos:
            if v.get("type") == "Trailer" and v.get("site") == "YouTube":
                return f"https://www.youtube.com/watch?v={v['key']}"

        return None

    except Exception as e:
        print(f"❌ Trailer error {id_imdb}: {e}")
        return None

# ============================================================
# INSERT
# ============================================================

def procesar_pelicula(data, ratings, id_titulo):
    id_api = data["id"]

    if not data.get("primaryTitle"):
        print(f"⚠️ Sin título: {id_titulo}")
        stats["notitle"] += 1
        return False

    titulo = data.get("primaryTitle")
    descripcion = data.get("plot")
    imagen = data.get("primaryImage", {}).get("url")
    anio = fecha(data.get("startYear"))

    nota, votos = ratings.get(id_api, (None, None))

    try:
        director_id = None

        if data.get("directors"):
            d = data["directors"][0]
            director_id = d["id"]

            cursor.execute("""
                INSERT IGNORE INTO Trabajadores (id_api, nombre)
                VALUES (%s, %s)
            """, (d["id"], d["displayName"]))

        cursor.execute("""
            INSERT IGNORE INTO Contenido
            (id_api, titulo_principal, id_director, tipo_contenido, descripcion, fecha, imagen_url, nota, n_votos)
            VALUES (%s,%s,
                (SELECT id_trabajador FROM Trabajadores WHERE id_api=%s),
                'PELICULA',%s,%s,%s,%s,%s)
        """, (id_api, titulo, director_id, descripcion, anio, imagen, nota, votos))

        contenido_id = cursor.lastrowid

        for g in data.get("genres", []):
            cursor.execute("""
                INSERT IGNORE INTO ContenidoPerteneceACategoria
                (id_contenido, nombreCategoria)
                VALUES (%s,%s)
            """, (contenido_id, GENEROS_ES.get(g, g)))

        # TMDB
        id_tmdb, tipo = obtener_tmdb(id_api)

        if id_tmdb == "429":
            print(f"⚠️ TMDB 429: {id_titulo}")
            guardar_429(id_titulo)
            stats["429"] += 1
            return False

        if id_tmdb is None:
            print(f"❌ TMDB no encontrado: {id_titulo}")
            stats["tmdb_fail"] += 1

        trailer = obtener_trailer(tipo, id_tmdb, id_titulo)

        cursor.execute("""
            UPDATE Contenido SET trailer_url=%s WHERE id_api=%s
        """, (trailer, id_api))

        stats["ok"] += 1
        return True

    except Exception as e:
        print(f"❌ Error IMDb {id_titulo}: {e}")
        stats["imdb_fail"] += 1
        return False

# ============================================================
# MAIN
# ============================================================

def procesar_lista(ids, ratings):
    procesados = 0

    for i, id_titulo in enumerate(ids, start=1):

        try:
            r = requests.get(f"{BASE_URL}/{id_titulo}", timeout=10)

            if r.status_code == 429:
                print(f"⚠️ IMDb 429: {id_titulo}")
                guardar_429(id_titulo)
                stats["429"] += 1
                continue

            if r.status_code != 200:
                stats["imdb_fail"] += 1
                continue

            data = r.json()

            ok = procesar_pelicula(data, ratings, id_titulo)

            if ok:
                procesados += 1

        except Exception as e:
            print(f"❌ Error general {id_titulo}: {e}")

        if i % 10 == 0:
            print(f"📊 {i}/{len(ids)} | OK: {procesados} | 429: {stats['429']}")

        if i % COMMIT_BATCH == 0:
            conn.commit()
            print(f"💾 COMMIT {i}")

    conn.commit()
    return procesados

# ============================================================
# MAIN
# ============================================================

def main():
    ratings = cargar_ratings()
    ids = leer_ids(IDS_ENTRADA)

    print(f"🚀 Procesando {len(ids)} IDs\n")

    procesados = procesar_lista(ids, ratings)

    print("\n==============================")
    print("📊 RESUMEN FINAL")
    print("==============================")
    print("OK:", stats["ok"])
    print("IMDb fail:", stats["imdb_fail"])
    print("TMDB fail:", stats["tmdb_fail"])
    print("Sin título:", stats["notitle"])
    print("429:", stats["429"])
    print("Total procesados:", procesados)

    print("\n🔁 Reintentando 429...")

    retries = leer_ids(FAILED_429_FILE)

    if retries:
        limpiar_429()
        procesar_lista(retries, ratings)

    print("\n✅ FIN")

if __name__ == "__main__":
    main()