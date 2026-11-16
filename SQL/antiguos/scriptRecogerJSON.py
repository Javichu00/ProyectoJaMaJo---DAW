import requests

TMDB_API_KEY = "02a35226a05c1ea60897c1d52a692fdf"

# Una serie conocida — Breaking Bad
id_imdb = "tt0903747"

# Paso 1: find — obtener id_tmdb
r = requests.get(f"https://api.themoviedb.org/3/find/{id_imdb}?api_key={TMDB_API_KEY}&external_source=imdb_id")
print("=== FIND ===")
print(r.json())

id_tmdb = r.json()["tv_results"][0]["id"]

# Paso 2: detalles de la serie — ver cuántas temporadas y qué campos hay
r2 = requests.get(f"https://api.themoviedb.org/3/tv/{id_tmdb}?api_key={TMDB_API_KEY}")
print("\n=== SERIE DETALLES ===")
print(r2.json())

# Paso 3: detalles de la temporada 1
r3 = requests.get(f"https://api.themoviedb.org/3/tv/{id_tmdb}/season/1?api_key={TMDB_API_KEY}")
print("\n=== TEMPORADA 1 ===")
print(r3.json())