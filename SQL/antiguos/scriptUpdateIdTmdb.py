import os
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

TMDB_API_KEY = "02a35226a05c1ea60897c1d52a692fdf"
TMDB_FIND_URL = "https://api.themoviedb.org/3/find/{id_imdb}?api_key={key}&external_source=imdb_id"

IDS_ENTRADA = "ids_filtrados.txt"
OUTPUT_SQL = "output_update_tmdb.sql"
WORKERS = 20


def leer_ids(path):
    with open(path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]


def obtener_id_tmdb(id_imdb):
    try:
        url = TMDB_FIND_URL.format(id_imdb=id_imdb, key=TMDB_API_KEY)
        r = requests.get(url, timeout=10)

        if r.status_code != 200:
            return None, f"⚠️  {id_imdb} — TMDB find HTTP {r.status_code}"

        data = r.json()

        if data.get("movie_results"):
            return data["movie_results"][0]["id"], None

        if data.get("tv_results"):
            return data["tv_results"][0]["id"], None

        return None, f"⚠️  {id_imdb} — no encontrado en TMDB"
    except Exception as e:
        return None, f"❌ {id_imdb} — error TMDB: {e}"


def generar_update(id_imdb, id_tmdb):
    if id_tmdb is None:
        return f"UPDATE Contenido SET id_tmdb = NULL WHERE id_api = '{id_imdb}';"
    return f"UPDATE Contenido SET id_tmdb = {id_tmdb} WHERE id_api = '{id_imdb}';"


def procesar_id(id_imdb):
    id_tmdb, error = obtener_id_tmdb(id_imdb)
    if error:
        return None, error
    return generar_update(id_imdb, id_tmdb), f"✅ {id_imdb} -> tmdb:{id_tmdb}"


def main():
    if not os.path.exists(IDS_ENTRADA):
        print(f"❌ No existe el fichero de entrada: {IDS_ENTRADA}")
        return

    ids = leer_ids(IDS_ENTRADA)
    if not ids:
        print("❌ ids_filtrados.txt está vacío.")
        return

    with open(OUTPUT_SQL, "w", encoding="utf-8") as f:
        f.write("USE JAMAJO_DDBB;\n\n")

    ok = 0
    fail = 0

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futures = {executor.submit(procesar_id, id_imdb): id_imdb for id_imdb in ids}

        for future in as_completed(futures):
            sql, msg = future.result()
            print(msg)

            if sql:
                with open(OUTPUT_SQL, "a", encoding="utf-8") as f:
                    f.write(sql + "\n")
                ok += 1
            else:
                fail += 1

    print(f"\n✅ Updates generados: {ok}")
    print(f"❌ Errores: {fail}")
    print(f"📄 Output: {OUTPUT_SQL}")


if __name__ == "__main__":
    main()
