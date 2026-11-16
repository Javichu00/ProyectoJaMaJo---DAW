# ============================================================
# constructorSQL.py
# ============================================================

import os
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

# ============================================================
# CONFIGURACIÓN
# ============================================================

IMDB_BASE_URL   = "https://api.imdbapi.dev/titles"
TMDB_API_KEY    = "02a35226a05c1ea60897c1d52a692fdf"

TMDB_FIND_URL   = "https://api.themoviedb.org/3/find/{imdb}?api_key={key}&external_source=imdb_id"
TMDB_MOVIE_URL  = "https://api.themoviedb.org/3/movie/{id}?api_key={key}&language={language}"
TMDB_TV_URL     = "https://api.themoviedb.org/3/tv/{id}?api_key={key}&language={language}"
TMDB_VIDEOS_URL = "https://api.themoviedb.org/3/{tipo}/{id}/videos?api_key={key}&language={language}"
TMDB_SEASON_URL = "https://api.themoviedb.org/3/tv/{id}/season/{season}?api_key={key}&language=es-ES"

IDS_ENTRADA     = "../../ids_filtrados.txt"

# Outputs SQL
OUTPUT_IMDB     = "../SQL/Populate_IMDB_Ligero.sql"
OUTPUT_TMDB     = "../SQL/Populate_TMDB_Ligero.sql"

# Logs de seguimiento
LOG_FALLIDOS_IMDB = "../TXTs/fallidos_imdb.txt"
LOG_FALLIDOS_TMDB = "../TXTs/fallidos_tmdb.txt"
LOG_SIN_TRAILER   = "../TXTs/sin_trailer.txt"
LOG_SIN_DESC      = "../TXTs/sin_descripcion.txt"
LOG_SIN_IDTMDB    = "../TXTs/sin_idtmdb.txt"
LOG_OMITIDOS      = "../TXTs/omitidos.txt"

WORKERS                = 6
DELAY_ENTRE_PETICIONES = 0.4
ESPERA_429             = 4

GREEN  = "\033[92m"
YELLOW = "\033[93m"
RED    = "\033[91m"
CYAN   = "\033[96m"
RESET  = "\033[0m"

# ============================================================
# MAPEO GÉNEROS
# ============================================================

GENEROS_ES = {
    "Action":      "Acción",
    "Adventure":   "Aventura",
    "Animation":   "Animación",
    "Biography":   "Biografía",
    "Comedy":      "Comedia",
    "Crime":       "Crimen",
    "Documentary": "Documental",
    "Drama":       "Drama",
    "Family":      "Familia",
    "Fantasy":     "Fantasía",
    "Film-Noir":   "Cine Negro",
    "History":     "Historia",
    "Horror":      "Terror",
    "Music":       "Música",
    "Musical":     "Musical",
    "Mystery":     "Misterio",
    "Romance":     "Romance",
    "Sci-Fi":      "Ciencia Ficción",
    "Sport":       "Deporte",
    "Thriller":    "Suspense",
    "War":         "Guerra",
    "Western":     "Western",
}

# ============================================================
# ESTADO COMPARTIDO
# ============================================================

lock         = threading.Lock()
ok_count     = 0
fail_count   = 0
done_count   = 0
ids_429      = []
tipos_por_id = {}

seen_trabajadores    = set()
seen_contenido       = set()
seen_actor_participa = set()
seen_categorias      = set()

resumen = {
    "imdb_ok":       0,
    "imdb_fail":     0,
    "imdb_omitidos": 0,
    "tmdb_ok":       0,
    "tmdb_fail":     0,
    "sin_trailer":   0,
    "sin_desc":      0,
    "sin_idtmdb":    0,
}

# ============================================================
# HELPERS SQL
# ============================================================

def esc(texto):
    if texto is None:
        return "NULL"
    return "'" + str(texto).replace("'", "''") + "'"

def fecha_anio(anio):
    if anio is None:
        return "NULL"
    return f"'{anio}-01-01'"

def fecha_str(s):
    if not s:
        return "NULL"
    return f"'{s}'"

# ============================================================
# HELPERS GENERALES
# ============================================================

def leer_ids(path):
    with open(path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]

def tipo_contenido(tipo_raw):
    if tipo_raw is None:
        return None
    t = tipo_raw.lower()
    if t == "movie":
        return "PELICULA"
    if t in ("tvseries", "tvminiseries"):
        return "SERIE"
    return None

def warn_null(id_api, campo):
    print(f"{YELLOW}  ⚠  {id_api} — {campo} quedará en NULL{RESET}")

def escribir_log(path, linea):
    with lock:
        with open(path, "a", encoding="utf-8") as f:
            f.write(linea + "\n")

# ============================================================
# PETICIONES HTTP
# ============================================================

def get_json(url, id_api="?", descripcion=""):
    try:
        time.sleep(DELAY_ENTRE_PETICIONES)
        r = requests.get(url, timeout=12)
        if r.status_code == 429:
            return None, "429"
        if r.status_code != 200:
            return None, f"HTTP {r.status_code}"
        return r.json(), None
    except Exception as e:
        return None, str(e)

# ============================================================
# HELPER: extraer el mejor trailer de YouTube
# ============================================================

def extraer_trailer(videos):
    yt = [v for v in videos if v.get("site") == "YouTube"]
    trailer = next((v for v in yt if v.get("type") == "Trailer" and v.get("official")), None)
    if trailer is None:
        trailer = next((v for v in yt if v.get("type") == "Trailer"), None)
    if trailer is None:
        trailer = next(iter(yt), None)
    return f"https://www.youtube.com/watch?v={trailer['key']}" if trailer else None

# ============================================================
# GENERADOR: Populate_IMDB.sql
# ============================================================

def generar_bloque_imdb(id_api, data):
    bloques = []
    tipo = tipo_contenido(data.get("type"))

    directores = data.get("directors") or []
    director   = directores[0] if directores else None
    dir_id_api = director["id"] if director else None

    if director:
        with lock:
            ya_visto = dir_id_api in seen_trabajadores
            if not ya_visto:
                seen_trabajadores.add(dir_id_api)
        if not ya_visto:
            foto     = director.get("primaryImage") or {}
            foto_url = foto.get("url")
            if foto_url is None:
                warn_null(id_api, f"rutaFoto del director {dir_id_api}")
            bloques.append(
                f"INSERT IGNORE INTO Trabajadores (id_api, nombre, rutaFoto) VALUES "
                f"({esc(dir_id_api)}, {esc(director['displayName'])}, {esc(foto_url)});"
            )

    actores = data.get("stars") or []
    for actor in actores:
        a_id = actor["id"]
        with lock:
            ya_visto = a_id in seen_trabajadores
            if not ya_visto:
                seen_trabajadores.add(a_id)
        if not ya_visto:
            foto     = actor.get("primaryImage") or {}
            foto_url = foto.get("url")
            if foto_url is None:
                warn_null(id_api, f"rutaFoto del actor {a_id}")
            bloques.append(
                f"INSERT IGNORE INTO Trabajadores (id_api, nombre, rutaFoto) VALUES "
                f"({esc(a_id)}, {esc(actor['displayName'])}, {esc(foto_url)});"
            )

    titulo   = data.get("primaryTitle")
    fecha    = fecha_anio(data.get("startYear"))
    imagen   = (data.get("primaryImage") or {}).get("url")
    nota_raw = data.get("rating") or {}
    nota     = nota_raw.get("aggregateRating")
    n_votos  = nota_raw.get("voteCount")

    if titulo  is None: warn_null(id_api, "titulo_principal")
    if imagen  is None: warn_null(id_api, "imagen_url")
    if nota    is None: warn_null(id_api, "nota")
    if n_votos is None: warn_null(id_api, "n_votos")
    if fecha == "NULL": warn_null(id_api, "fecha")

    dir_subquery = (
        f"(SELECT id_trabajador FROM Trabajadores WHERE id_api = {esc(dir_id_api)})"
        if director else "NULL"
    )

    with lock:
        ya_visto_cont = id_api in seen_contenido
        if not ya_visto_cont:
            seen_contenido.add(id_api)

    if not ya_visto_cont:
        bloques.append(
            f"INSERT IGNORE INTO Contenido "
            f"(id_api, titulo_principal, id_director, tipo_contenido, fecha, imagen_url, nota, n_votos) VALUES ("
            f"{esc(id_api)}, "
            f"{esc(titulo)}, "
            f"{dir_subquery}, "
            f"'{tipo}', "
            f"{fecha}, "
            f"{esc(imagen)}, "
            f"{'NULL' if nota is None else nota}, "
            f"{'NULL' if n_votos is None else n_votos}"
            f");"
        )

    contenido_sq = f"(SELECT id_contenido FROM Contenido WHERE id_api = {esc(id_api)})"

    if tipo == "PELICULA":
        duracion_seg = data.get("runtimeSeconds")
        duracion_min = (duracion_seg // 60) if duracion_seg else 0
        if duracion_seg is None:
            warn_null(id_api, "duracion (se usará 0)")
        bloques.append(
            f"INSERT IGNORE INTO Pelicula (id_contenido, duracion) VALUES "
            f"({contenido_sq}, {duracion_min});"
        )
    else:
        bloques.append(
            f"INSERT IGNORE INTO Serie (id_contenido) VALUES "
            f"({contenido_sq});"
        )

    for actor in actores:
        a_id = actor["id"]
        key  = (id_api, a_id)
        with lock:
            ya_rel = key in seen_actor_participa
            if not ya_rel:
                seen_actor_participa.add(key)
        if not ya_rel:
            trab_sq = f"(SELECT id_trabajador FROM Trabajadores WHERE id_api = {esc(a_id)})"
            bloques.append(
                f"INSERT IGNORE INTO ActorParticipa (id_contenido, id_trabajador) VALUES "
                f"({contenido_sq}, {trab_sq});"
            )

    generos = data.get("genres") or []
    if not generos:
        warn_null(id_api, "géneros")
    for g in generos:
        nombre_es = GENEROS_ES.get(g, g)
        key = (id_api, nombre_es)
        with lock:
            ya_cat = key in seen_categorias
            if not ya_cat:
                seen_categorias.add(key)
        if not ya_cat:
            bloques.append(
                f"INSERT IGNORE INTO ContenidoPerteneceACategoria (id_contenido, nombreCategoria) VALUES "
                f"({contenido_sq}, {esc(nombre_es)});"
            )

    return bloques

# ============================================================
# GENERADOR: Populate_TMDB.sql
# ============================================================

def generar_bloque_tmdb(id_api, tipo):
    bloques = []

    data_find, err = get_json(
        TMDB_FIND_URL.format(imdb=id_api, key=TMDB_API_KEY),
        id_api, "TMDB find"
    )
    if err == "429":
        return None, "429"
    if err or not data_find:
        print(f"{RED}  ✗  {id_api} — TMDB find error: {err}{RESET}")
        escribir_log(LOG_FALLIDOS_TMDB, f"{id_api}\tTMDB find error: {err}")
        return [], None

    id_tmdb   = None
    tipo_tmdb = None

    if data_find.get("movie_results"):
        id_tmdb   = data_find["movie_results"][0]["id"]
        tipo_tmdb = "movie"
    elif data_find.get("tv_results"):
        id_tmdb   = data_find["tv_results"][0]["id"]
        tipo_tmdb = "tv"
    else:
        warn_null(id_api, "id_tmdb (no encontrado en TMDB)")
        with lock:
            resumen["sin_idtmdb"] += 1
        escribir_log(LOG_SIN_IDTMDB, id_api)
        return [], None

    # ── CAMBIO CLAVE ──
    # Ahora usamos id_contenido directamente, sin pasar por Serie
    contenido_sq = f"(SELECT id_contenido FROM Contenido WHERE id_api = {esc(id_api)})"

    descripcion = None
    data_det    = None

    url_det_es = (TMDB_MOVIE_URL if tipo_tmdb == "movie" else TMDB_TV_URL).format(
        id=id_tmdb, key=TMDB_API_KEY, language="es-ES"
    )
    data_det, err = get_json(url_det_es, id_api, "TMDB detalle ES")
    if err == "429":
        return None, "429"

    if data_det:
        descripcion = data_det.get("overview") or None

    if descripcion is None:
        url_det_en = (TMDB_MOVIE_URL if tipo_tmdb == "movie" else TMDB_TV_URL).format(
            id=id_tmdb, key=TMDB_API_KEY, language="en-US"
        )
        data_det_en, err_en = get_json(url_det_en, id_api, "TMDB detalle EN fallback")
        if err_en == "429":
            return None, "429"
        if data_det_en:
            descripcion = data_det_en.get("overview") or None
            if descripcion:
                print(f"{YELLOW}  ↩  {id_api} — descripción obtenida en inglés (fallback){RESET}")
            if data_det is None:
                data_det = data_det_en

    if descripcion is None:
        warn_null(id_api, "descripcion (vacía tanto en ES como en EN)")
        with lock:
            resumen["sin_desc"] += 1
        escribir_log(LOG_SIN_DESC, id_api)

    trailer_url = None

    data_vid_es, err_vid = get_json(
        TMDB_VIDEOS_URL.format(tipo=tipo_tmdb, id=id_tmdb, key=TMDB_API_KEY, language="es-ES"),
        id_api, "TMDB videos ES"
    )
    if err_vid == "429":
        return None, "429"

    if data_vid_es:
        trailer_url = extraer_trailer(data_vid_es.get("results") or [])

    if trailer_url is None:
        data_vid_en, err_vid_en = get_json(
            TMDB_VIDEOS_URL.format(tipo=tipo_tmdb, id=id_tmdb, key=TMDB_API_KEY, language="en-US"),
            id_api, "TMDB videos EN fallback"
        )
        if err_vid_en == "429":
            return None, "429"
        if data_vid_en:
            trailer_url = extraer_trailer(data_vid_en.get("results") or [])
            if trailer_url:
                print(f"{YELLOW}  ↩  {id_api} — trailer obtenido en inglés (fallback){RESET}")

    if trailer_url is None:
        warn_null(id_api, "trailer_url (no encontrado ni en ES ni en EN)")
        with lock:
            resumen["sin_trailer"] += 1
        escribir_log(LOG_SIN_TRAILER, id_api)

    bloques.append(
        f"UPDATE Contenido SET "
        f"id_tmdb = {id_tmdb}, "
        f"descripcion = {esc(descripcion)}, "
        f"trailer_url = {esc(trailer_url)} "
        f"WHERE id_api = {esc(id_api)};"
    )

    # ── CAMBIO CLAVE ──
    # Temporada ahora referencia id_contenido directamente (no id_serie)
    if tipo == "SERIE" and tipo_tmdb == "tv" and data_det:
        seasons = data_det.get("seasons") or []

        for season in seasons:
            numero = season.get("season_number", 0)
            if numero == 0:
                continue

            nombre_temp = season.get("name")
            desc_temp   = season.get("overview") or None

            bloques.append(
                f"INSERT IGNORE INTO Temporada (id_serie, numero_temporada, nombre, descripcion) VALUES ("
                f"{contenido_sq}, {numero}, {esc(nombre_temp)}, {esc(desc_temp)});"
            )

            temp_sq = (
                f"(SELECT id_temporada FROM Temporada WHERE "
                f"id_serie = {contenido_sq} AND numero_temporada = {numero})"
            )

            data_ep, err_ep = get_json(
                TMDB_SEASON_URL.format(id=id_tmdb, season=numero, key=TMDB_API_KEY),
                id_api, f"T{numero}"
            )
            if err_ep == "429":
                return None, "429"
            if not data_ep:
                print(f"{YELLOW}  ⚠  {id_api} T{numero} — no se pudieron obtener episodios{RESET}")
                continue

            episodios = data_ep.get("episodes") or []
            for ep in episodios:
                num_ep    = ep.get("episode_number")
                titulo_ep = ep.get("name")
                desc_ep   = ep.get("overview") or None
                dur_ep    = ep.get("runtime") or 0
                fecha_ep  = fecha_str(ep.get("air_date"))

                if dur_ep == 0:
                    warn_null(id_api, f"duracion episodio S{numero}E{num_ep} (usará 0)")

                bloques.append(
                    f"INSERT IGNORE INTO Episodio "
                    f"(id_temporada, numero_episodio, titulo, descripcion, duracion, fecha_emision) VALUES ("
                    f"{temp_sq}, {num_ep}, {esc(titulo_ep)}, {esc(desc_ep)}, {dur_ep}, {fecha_ep});"
                )

    return bloques, None

# ============================================================
# WORKERS
# ============================================================

def worker_imdb(id_api, total):
    global ok_count, fail_count, done_count

    data, err = get_json(f"{IMDB_BASE_URL}/{id_api}", id_api, "IMDb")

    with lock:
        done_count += 1
        progreso = done_count

    if err == "429":
        with lock:
            ids_429.append(id_api)
            fail_count += 1
            _ok = ok_count; _429 = len(ids_429); _err = fail_count - _429
        print(f"{YELLOW}  ⚠  [{progreso}/{total}]  ✔ {_ok} | ⚠ {_429} | ✗ {_err}   {id_api} — 429 rate limit{RESET}")
        return None

    if err or not data:
        with lock:
            fail_count += 1
            resumen["imdb_fail"] += 1
            _ok = ok_count; _429 = len(ids_429); _err = fail_count - _429
        escribir_log(LOG_FALLIDOS_IMDB, f"{id_api}\t{err}")
        print(f"{RED}  ✗  [{progreso}/{total}]  ✔ {_ok} | ⚠ {_429} | ✗ {_err}   {id_api} — {err}{RESET}")
        return None

    tipo = tipo_contenido(data.get("type"))
    if tipo is None:
        with lock:
            fail_count += 1
            resumen["imdb_omitidos"] += 1
            _ok = ok_count; _429 = len(ids_429); _err = fail_count - _429
        escribir_log(LOG_OMITIDOS, f"{id_api}\t{data.get('type', 'desconocido')}")
        print(f"{YELLOW}  ⏭  [{progreso}/{total}]  ✔ {_ok} | ⚠ {_429} | ✗ {_err}   {id_api} — tipo '{data.get('type')}' omitido{RESET}")
        return None

    bloques = generar_bloque_imdb(id_api, data)

    with lock:
        ok_count += 1
        tipos_por_id[id_api] = tipo
        resumen["imdb_ok"] += 1
        _ok = ok_count; _429 = len(ids_429); _err = fail_count - _429
    print(f"{GREEN}  ✔  [{progreso}/{total}]  ✔ {_ok} | ⚠ {_429} | ✗ {_err}   {data.get('primaryTitle', id_api)} ({tipo}){RESET}")

    return "\n".join(bloques)


def worker_tmdb(id_api, tipo, total):
    global ok_count, fail_count, done_count

    bloques, err = generar_bloque_tmdb(id_api, tipo)

    with lock:
        done_count += 1
        progreso = done_count

    if err == "429":
        with lock:
            ids_429.append(id_api)
            fail_count += 1
            _ok = ok_count; _429 = len(ids_429); _err = fail_count - _429
        print(f"{YELLOW}  ⚠  [{progreso}/{total}]  ✔ {_ok} | ⚠ {_429} | ✗ {_err}   {id_api} — 429 rate limit{RESET}")
        return None

    if bloques is None:
        with lock:
            fail_count += 1
            resumen["tmdb_fail"] += 1
            _ok = ok_count; _429 = len(ids_429); _err = fail_count - _429
        escribir_log(LOG_FALLIDOS_TMDB, f"{id_api}\terror inesperado")
        print(f"{RED}  ✗  [{progreso}/{total}]  ✔ {_ok} | ⚠ {_429} | ✗ {_err}   {id_api} — error TMDB{RESET}")
        return None

    with lock:
        ok_count += 1
        resumen["tmdb_ok"] += 1
        _ok = ok_count; _429 = len(ids_429); _err = fail_count - _429
    print(f"{GREEN}  ✔  [{progreso}/{total}]  ✔ {_ok} | ⚠ {_429} | ✗ {_err}   {id_api} — TMDB OK{RESET}")

    return "\n".join(bloques)

# ============================================================
# TANDAS
# ============================================================

def ejecutar_tanda_imdb(ids, output_file):
    global ok_count, fail_count, done_count, ids_429

    ok_count = fail_count = done_count = 0
    ids_429  = []
    total    = len(ids)

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futuros = {executor.submit(worker_imdb, id_api, total): id_api for id_api in ids}
        with open(output_file, "a", encoding="utf-8") as f:
            for futuro in as_completed(futuros):
                sql = futuro.result()
                if sql:
                    f.write("\n\n" + sql)

    return ids_429.copy()


def ejecutar_tanda_tmdb(pares_id_tipo, output_file):
    global ok_count, fail_count, done_count, ids_429

    ok_count = fail_count = done_count = 0
    ids_429  = []
    total    = len(pares_id_tipo)

    with ThreadPoolExecutor(max_workers=WORKERS) as executor:
        futuros = {
            executor.submit(worker_tmdb, id_api, tipo, total): (id_api, tipo)
            for (id_api, tipo) in pares_id_tipo
        }
        with open(output_file, "a", encoding="utf-8") as f:
            for futuro in as_completed(futuros):
                sql = futuro.result()
                if sql:
                    f.write("\n\n" + sql)

    return ids_429.copy()

# ============================================================
# FASE 1: IMDB
# ============================================================

def fase_imdb(ids_iniciales):
    print(f"\n{CYAN}{'='*60}")
    print(f"  FASE 1 — Populate_IMDB.sql")
    print(f"  Total IDs: {len(ids_iniciales)}")
    print(f"{'='*60}{RESET}\n")

    for path in [LOG_FALLIDOS_IMDB, LOG_OMITIDOS]:
        open(path, "w").close()

    with open(OUTPUT_IMDB, "w", encoding="utf-8") as f:
        f.write("USE JAMAJO_DDBB;\n")

    ids_pendientes = ids_iniciales
    ronda = 1

    while ids_pendientes:
        print(f"{CYAN}  Ronda {ronda} — {len(ids_pendientes)} IDs{RESET}")
        fallidos_429 = ejecutar_tanda_imdb(ids_pendientes, OUTPUT_IMDB)

        errores_reales = fail_count - len(fallidos_429)
        print(f"\n  Ronda {ronda} terminada — ✔ {ok_count} OK / ✗ {errores_reales} errores / ⚠ {len(fallidos_429)} rate-limited\n")

        if not fallidos_429:
            break

        print(f"{YELLOW}  Esperando {ESPERA_429}s antes de reintentar {len(fallidos_429)} IDs con 429...{RESET}")
        time.sleep(ESPERA_429)
        ids_pendientes = fallidos_429
        ronda += 1

    print(f"{GREEN}  ✔ Fase 1 completada → {OUTPUT_IMDB}{RESET}\n")

# ============================================================
# FASE 2: TMDB
# ============================================================

def fase_tmdb():
    print(f"\n{CYAN}{'='*60}")
    print(f"  FASE 2 — Populate_TMDB.sql")
    print(f"  IDs válidos (de fase 1): {len(tipos_por_id)}")
    print(f"{'='*60}{RESET}\n")

    for path in [LOG_FALLIDOS_TMDB, LOG_SIN_TRAILER, LOG_SIN_DESC, LOG_SIN_IDTMDB]:
        open(path, "w").close()

    with open(OUTPUT_TMDB, "w", encoding="utf-8") as f:
        f.write("USE JAMAJO_DDBB;\n")

    pares          = list(tipos_por_id.items())
    ids_pendientes = pares
    ronda          = 1

    while ids_pendientes:
        print(f"{CYAN}  Ronda {ronda} — {len(ids_pendientes)} IDs{RESET}")
        fallidos_429_ids = ejecutar_tanda_tmdb(ids_pendientes, OUTPUT_TMDB)

        errores_reales = fail_count - len(fallidos_429_ids)
        print(f"\n  Ronda {ronda} terminada — ✔ {ok_count} OK / ✗ {errores_reales} errores / ⚠ {len(fallidos_429_ids)} rate-limited\n")

        if not fallidos_429_ids:
            break

        set_429   = set(fallidos_429_ids)
        pares_429 = [(id_api, tipo) for (id_api, tipo) in pares if id_api in set_429]

        print(f"{YELLOW}  Esperando {ESPERA_429}s antes de reintentar {len(pares_429)} IDs con 429...{RESET}")
        time.sleep(ESPERA_429)
        ids_pendientes = pares_429
        ronda += 1

    print(f"{GREEN}  ✔ Fase 2 completada → {OUTPUT_TMDB}{RESET}\n")

# ============================================================
# RESUMEN FINAL
# ============================================================

def imprimir_resumen():
    sep = "=" * 60
    print(f"\n{CYAN}{sep}")
    print(f"  RESUMEN FINAL")
    print(f"{sep}{RESET}")

    print(f"\n  {GREEN}FASE 1 — IMDb{RESET}")
    print(f"    ✔  Procesados OK:    {resumen['imdb_ok']}")
    print(f"    ⏭  Omitidos (tipo):  {resumen['imdb_omitidos']}  → {LOG_OMITIDOS}")
    print(f"    ✗  Errores reales:   {resumen['imdb_fail']}  → {LOG_FALLIDOS_IMDB}")

    print(f"\n  {GREEN}FASE 2 — TMDB{RESET}")
    print(f"    ✔  Procesados OK:    {resumen['tmdb_ok']}")
    print(f"    ✗  Errores reales:   {resumen['tmdb_fail']}  → {LOG_FALLIDOS_TMDB}")
    print(f"    ⚠  Sin id_tmdb:      {resumen['sin_idtmdb']}  → {LOG_SIN_IDTMDB}")
    print(f"    ⚠  Sin descripción:  {resumen['sin_desc']}  → {LOG_SIN_DESC}")
    print(f"    ⚠  Sin trailer:      {resumen['sin_trailer']}  → {LOG_SIN_TRAILER}")

    print(f"\n  {GREEN}ARCHIVOS GENERADOS{RESET}")
    print(f"    → {OUTPUT_IMDB}")
    print(f"    → {OUTPUT_TMDB}")
    print(f"    → {LOG_FALLIDOS_IMDB}")
    print(f"    → {LOG_FALLIDOS_TMDB}")
    print(f"    → {LOG_SIN_TRAILER}")
    print(f"    → {LOG_SIN_DESC}")
    print(f"    → {LOG_SIN_IDTMDB}")
    print(f"    → {LOG_OMITIDOS}")
    print(f"\n{CYAN}{sep}{RESET}\n")

# ============================================================
# MAIN
# ============================================================

def main():
    if not os.path.exists(IDS_ENTRADA):
        print(f"{RED}❌ No existe el fichero: {IDS_ENTRADA}{RESET}")
        return

    ids = leer_ids(IDS_ENTRADA)
    if not ids:
        print(f"{RED}❌ {IDS_ENTRADA} está vacío.{RESET}")
        return

    print(f"{CYAN}{'='*60}")
    print(f"  constructorSQL.py")
    print(f"  IDs a procesar: {len(ids)}")
    print(f"{'='*60}{RESET}")

    fase_imdb(ids)
    fase_tmdb()
    imprimir_resumen()


if __name__ == "__main__":
    main()