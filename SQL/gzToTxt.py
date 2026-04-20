import gzip

IDS_VALIDOS = []

with gzip.open("title.basics.tsv.gz", "rt", encoding="utf-8") as f:
    next(f)  # saltar cabecera
    for linea in f:
        campos = linea.strip().split("\t")
        tconst = campos[0]
        tipo   = campos[1]

        if tipo in ("movie", "tvSeries"):
            IDS_VALIDOS.append(tconst)

with open("ids_validos.txt", "w") as f:
    for id in IDS_VALIDOS:
        f.write(id + "\n")

print(f"Total IDs extraídos: {len(IDS_VALIDOS)}")