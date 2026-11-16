input_file = "output_update_tmdb.sql"
output_file = "limpio_updates.sql"

seen = set()

with open(input_file, "r", encoding="utf-8") as infile, \
     open(output_file, "w", encoding="utf-8") as outfile:

    for line in infile:
        if line not in seen:
            outfile.write(line)
            seen.add(line)

print("Archivo generado sin líneas duplicadas.")