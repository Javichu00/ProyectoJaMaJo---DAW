import mysql.connector

# CONFIG DB
config = {
    "host": "localhost",
    "user": "root",
    "password": "AlumnoIFP",
    "database": "JAMAJO_DDBB"
}

INPUT_FILE = "limpio_updates.sql"
ERROR_FILE = "updates_errores.txt"

def ejecutar_updates():
    conn = mysql.connector.connect(**config)
    cursor = conn.cursor()

    with open(INPUT_FILE, "r", encoding="utf-8") as f:
        contenido = f.read()

    # Separar por ;
    queries = contenido.split(";")

    errores = []
    ejecutadas = 0

    for i, query in enumerate(queries, 1):
        query = query.strip()

        if not query:
            continue

        try:
            cursor.execute(query)
            conn.commit()
            ejecutadas += 1

            if ejecutadas % 10 == 0:
                print(f"✔ Ejecutadas: {ejecutadas}")

        except Exception as e:
            print(f"❌ Error en query {i}")
            errores.append((i, query, str(e)))

    cursor.close()
    conn.close()

    # Guardar errores
    with open(ERROR_FILE, "w", encoding="utf-8") as f:
        for i, q, err in errores:
            f.write(f"\n--- Query {i} ---\n")
            f.write(q + "\n")
            f.write("ERROR: " + err + "\n")

    print("\n✔ Proceso terminado")
    print(f"✔ Ejecutadas correctamente: {ejecutadas}")
    print(f"❌ Errores: {len(errores)}")
    print(f"📄 Guardados en: {ERROR_FILE}")


if __name__ == "__main__":
    ejecutar_updates()