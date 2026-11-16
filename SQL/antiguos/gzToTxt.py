import gzip

contador = 0

with gzip.open("title.ratings.tsv.gz", "rt", encoding="utf-8") as f_in, \
     open("ids_filtrados.txt", "w") as f_out:
    
    next(f_in)  # saltar cabecera
    
    for linea in f_in:
        campos    = linea.strip().split("\t")
        tconst    = campos[0]
        num_votes = int(campos[2])

        if num_votes >= 45000:
            f_out.write(tconst + "\n")
            contador += 1

print(f"✅ ids_filtrados.txt generado con {contador} IDs")