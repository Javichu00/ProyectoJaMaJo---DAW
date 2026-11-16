import requests
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

API_KEY = "02a35226a05c1ea60897c1d52a692fdf"
IDS_FILE = "ids_filtrados.txt"
OUTPUT = "Populate_datos_tmdb.sql"

TMDB_FIND = "https://api.themoviedb.org/3/find/{imdb}?api_key={key}&external_source=imdb_id"
TMDB_MOVIE = "https://api.themoviedb.org/3/movie/{id}?api_key={key}&language=es-ES"
TMDB_TV = "https://api.themoviedb.org/3/tv/{id}?api_key={key}&language=es-ES"
TMDB_SEASON = "https://api.themoviedb.org/3/tv/{id}/season/{season}?api_key={key}&language=es-ES"

lock = threading.Lock()

cache_tmdb = {}

ok = 0
fail = 0
done = 0


def esc(t):
    return "'" + t.replace("'", "''") + "'" if t else "NULL"


def read_ids():
    with open(IDS_FILE, "r", encoding="utf-8") as f:
        return [x.strip() for x in f if x.strip()]


# ============================================================
# TMDB FIND (CACHE)
# ============================================================

def get_tmdb(imdb):
    if imdb in cache_tmdb:
        return cache_tmdb[imdb]

    r = requests.get(TMDB_FIND.format(imdb=imdb, key=API_KEY), timeout=10)

    if r.status_code != 200:
        return None, None

    data = r.json()

    if data.get("movie_results"):
        res = (data["movie_results"][0]["id"], "movie")
    elif data.get("tv_results"):
        res = (data["tv_results"][0]["id"], "tv")
    else:
        res = (None, None)

    cache_tmdb[imdb] = res
    return res


# ============================================================
# WORKER
# ============================================================

def process(imdb, total):
    global ok, fail, done

    try:
        id_tmdb, tipo = get_tmdb(imdb)

        sql = []

        if not id_tmdb:
            with lock:
                fail += 1
                done += 1
                print(f"❌ {done}/{total} — FAIL {imdb}")
            return ""

        # ---------------- MOVIE ----------------
        if tipo == "movie":
            r = requests.get(TMDB_MOVIE.format(id=id_tmdb, key=API_KEY), timeout=10)

            if r.status_code == 200:
                data = r.json()
                ov = data.get("overview")

                if ov:
                    sql.append(f"""
UPDATE Contenido
SET id_tmdb = {id_tmdb},
    descripcion = {esc(ov)}
WHERE id_api = '{imdb}';
""")

        # ---------------- TV ----------------
        else:
            r = requests.get(TMDB_TV.format(id=id_tmdb, key=API_KEY), timeout=10)

            if r.status_code == 200:
                data = r.json()
                ov = data.get("overview")

                if ov:
                    sql.append(f"""
UPDATE Contenido
SET id_tmdb = {id_tmdb},
    descripcion = {esc(ov)}
WHERE id_api = '{imdb}';
""")

                for s in data.get("seasons", []):
                    sn = s["season_number"]
                    if sn == 0:
                        continue

                    rs = requests.get(
                        TMDB_SEASON.format(id=id_tmdb, season=sn, key=API_KEY),
                        timeout=10
                    )

                    if rs.status_code != 200:
                        continue

                    season = rs.json()

                    for ep in season.get("episodes", []):
                        ov = ep.get("overview")
                        if not ov:
                            continue

                        sql.append(f"""
UPDATE Episodio
SET descripcion = {esc(ov)}
WHERE id_temporada = (
    SELECT id_temporada FROM Temporada
    WHERE id_serie = (
        SELECT id_serie FROM Serie
        WHERE id_contenido = (SELECT id_contenido FROM Contenido WHERE id_api = '{imdb}')
    )
    AND numero_temporada = {sn}
)
AND numero_episodio = {ep['episode_number']};
""")

        with lock:
            ok += 1
            done += 1
            print(f"✅ {done}/{total} — OK {imdb}")

        return "\n".join(sql)

    except Exception as e:
        with lock:
            fail += 1
            done += 1
            print(f"❌ {done}/{total} — ERROR {imdb}")
        return ""


# ============================================================
# MAIN
# ============================================================

def main():
    ids = read_ids()
    total = len(ids)

    print(f"🚀 Total a procesar: {total}\n")

    results = []

    with ThreadPoolExecutor(max_workers=70) as executor:
        futures = [executor.submit(process, i, total) for i in ids]

        for f in as_completed(futures):
            res = f.result()
            if res:
                results.append(res)

    with open(OUTPUT, "w", encoding="utf-8") as f:
        f.write("USE JAMAJO_DDBB;\n\n")
        f.write("\n".join(results))

    print("\n==============================")
    print(f"✔ OK: {ok}")
    print(f"❌ FAIL: {fail}")
    print(f"📄 OUTPUT: {OUTPUT}")


if __name__ == "__main__":
    main()