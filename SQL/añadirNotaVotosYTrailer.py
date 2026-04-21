import requests
import gzip
import os
from concurrent.futures import ThreadPoolExecutor, as_completed

# ============================================================
# CONFIGURACIÓN
# ============================================================

TMDB_API_KEY     = "02a35226a05c1ea60897c1d52a692fdf"
TMDB_FIND_URL    = "https://api.themoviedb.org/3/find/{id_imdb}?api_key={key}&external_source=imdb_id"
TMDB_TRAILER_URL = "https://api.themoviedb.org/3/{tipo}/{id_tmdb}/videos?api_key={key}"

RATINGS_GZ   = "title.ratings.tsv.gz"
IDS_ENTRADA  = "ids_filtrados.txt"
OUTPUT_SQL   = "output_update.sql"
WORKERS      = 100

# ============================================================
# CARGAR RATINGS EN MEMORIA
# ============================================================

def cargar_ratings():
    print("📂 Cargando ratings...")
    ratings = {}
    with gzip.open(RATINGS_GZ, "rt", encoding="utf-8") as f:
        next(f)  # saltar cabecera
        for linea in f:
            campos = linea.strip().split("\t")
            tconst    = campos[0]
            nota      = campos[1]
            n_votos   = campos[2]
            ratings[tconst] = (nota, n_votos)
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

# ============================================================
# OBTENER TRAILER
# ============================================================

def obtener_trailer(id_imdb):
    try:
        # Primera llamada — buscar id TMDB
        url_find = TMDB_FIND_URL.format(id_imdb=id_imdb, key=TMDB_API_KEY)
        r = requests.get(url_find, timeout=10)

        if r.status_code != 200:
            print(f"⚠️  {id_imdb} — TMDB find HTTP {r.status_code}")
            return None

        data = r.json()

        # Determinar si es película o serie
        if data.get("movie_results"):
            id_tmdb = data["movie_results"][0]["id"]
            tipo    = "movie"
        elif data.get("tv_results"):
            id_tmdb = data["tv_results"][0]["id"]
            tipo    = "tv"
        else:
            print(f"⚠️  {id_imdb} — no encontrado en TMDB")
            return None

        # Segunda llamada — buscar videos
        url_videos = TMDB_TRAILER_URL.format(tipo=tipo, id_tmdb=id_tmdb, key=TMDB_API_KEY)
        r2 = requests.get(url_videos, timeout=10)

        if r2.status_code != 200:
            print(f"⚠️  {id_imdb} — TMDB videos HTTP {r2.status_code}")
            return None

        videos = r2.json().get("results", [])

        if not videos:
            print(f"🎬 {id_imdb} — sin trailer disponible")
            return None

        # Buscar primero uno con type Trailer, si no el primero
        trailer = next((v for v in videos if v.get("type") == "Trailer"), videos[0])

        if trailer.get("site") == "YouTube":
            return f"https://www.youtube.com/watch?v={trailer['key']}"
        else:
            print(f"⚠️  {id_imdb} — trailer no es YouTube ({trailer.get('site')})")
            return None

    except Exception as e:
        print(f"❌ {id_imdb} — error obteniendo trailer: {e}")
        return None

# ============================================================
# GENERAR UPDATE
# ============================================================

def generar_update(id_imdb, nota, n_votos, trailer_url):
    trailer_sql = escapar(trailer_url)
    return (
        f"UPDATE Contenido SET "
        f"nota = {nota}, "
        f"n_votos = {n_votos}, "
        f"trailer_url = {trailer_sql} "
        f"WHERE id_api = '{id_imdb}';"
    )

# ============================================================
# PROCESAR ID
# ============================================================

def procesar_id(id_imdb, ratings, fichero_fallidos):
    try:
        # Nota y votos desde ratings
        if id_imdb not in ratings:
            return None, f"⚠️  {id_imdb} — sin rating"

        nota, n_votos = ratings[id_imdb]

        # Trailer desde TMDB
        trailer_url = obtener_trailer(id_imdb)

        sql = generar_update(id_imdb, nota, n_votos, trailer_url)
        titulo = id_imdb
        return sql, f"✅ {titulo} — nota:{nota} votos:{n_votos} trailer:{'sí' if trailer_url else 'no'}"

    except Exception as e:
        with open(fichero_fallidos, "a", encoding="utf-8") as f:
            f.write(id_imdb + "\n")
        return None, f"❌ {id_imdb} — {e}"

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
        futuros = {executor.submit(procesar_id, id_imdb, ratings, fichero_fallidos): id_imdb for id_imdb in ids}

        for futuro in as_completed(futuros):
            sql, mensaje = futuro.result()
            print(mensaje)

            if sql:
                with open(OUTPUT_SQL, "a", encoding="utf-8") as f:
                    f.write(sql + "\n")
                procesados += 1
            else:
                fallidos += 1

            print(f"   ✅ {procesados} procesados / ❌ {fallidos} fallidos")

    return procesados, fallidos

# ============================================================
# MAIN
# ============================================================

def main():
    ratings        = cargar_ratings()
    ronda          = 1
    total_proc     = 0
    total_fall     = 0
    fichero_actual = IDS_ENTRADA

    while True:
        if not os.path.exists(fichero_actual):
            print(f"✅ No existe {fichero_actual}, hemos terminado.")
            break

        ids = leer_ids(fichero_actual)

        if not ids:
            print(f"✅ {fichero_actual} vacío, hemos terminado.")
            break

        fichero_fallidos = f"fallidos{ronda}.txt"
        print(f"\n🔁 Ronda {ronda} — {len(ids)} IDs — fallidos → {fichero_fallidos}")

        proc, fall = procesar_tanda(ids, ratings, fichero_fallidos)
        total_proc += proc
        total_fall += fall

        print(f"\n   Ronda {ronda} terminada — ✅ {proc} / ❌ {fall}")

        fichero_actual = fichero_fallidos
        ronda += 1

        if fall == 0:
            print(f"\n🎉 Sin fallidos, proceso completado.")
            break

    print(f"\n{'='*50}")
    print(f"TOTAL procesados: {total_proc}")
    print(f"TOTAL fallidos:   {total_fall}")
    print(f"Output:           {OUTPUT_SQL}")

if __name__ == "__main__":
    main()