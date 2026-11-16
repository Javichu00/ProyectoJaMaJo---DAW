@echo off
setlocal

rem ================= CONFIGURACION (solo si hace falta) =================
rem Si "mysql" no se reconoce, pon aqui la ruta de su carpeta bin, CON barra final.
rem Ejemplo: set "MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.0\bin\"
set "MYSQL_BIN=C:\Program Files\MySQL\MySQL Server 8.3\bin\"
set "DB_USER=root"
set "DB_PASS=AlumnoIFP"
set "DB_NAME=JAMAJO_DDBB"
rem ======================================================================

set "RAIZ=%~dp0"
set "COPIA=%RAIZ%copia\jamajo.sql"
set "BACK=%RAIZ%Back\ProyectoSpring_BackendJaMaJo"
set "FRONT=%RAIZ%Front\codigo\html\landing.html"

echo.
echo  ===== JAMAJO =====
echo  1) PRIMERA VEZ: guardar la BD en D: y crear el jar
echo     (hazlo cuando ya hayas cargado los SQL y todo funcione)
echo  2) INICIAR TODO (uso diario)
echo  3) Guardar cambios de la BD (copia nueva)
echo.
choice /c 123 /n /m "Elige 1, 2 o 3: "
if errorlevel 3 (
    call :dump
    goto fin
)
if errorlevel 2 (
    call :iniciar
    goto fin
)
call :primera
goto fin

:fin
echo.
pause
exit /b

:dump
if not exist "%RAIZ%copia" mkdir "%RAIZ%copia"
echo Guardando la base de datos...
"%MYSQL_BIN%mysqldump" -u%DB_USER% -p%DB_PASS% --single-transaction --default-character-set=utf8mb4 --databases %DB_NAME% > "%COPIA%.tmp"
if errorlevel 1 (
    echo ERROR: no se pudo guardar la BD.
    echo Revisa usuario y clave, y que MySQL este en marcha.
    del "%COPIA%.tmp" 2>nul
    exit /b 1
)
move /y "%COPIA%.tmp" "%COPIA%" >nul
echo OK: copia guardada en %COPIA%
exit /b 0

:primera
call :dump
if errorlevel 1 exit /b 1
echo.
echo Creando el jar del backend. Necesita internet y tarda un poco...
pushd "%BACK%"
call mvnw.cmd package -DskipTests
popd
echo.
echo Listo. A partir de ahora usa la opcion 2.
exit /b 0

:iniciar
if not exist "%COPIA%" (
    echo No existe la copia de la BD. Haz primero la opcion 1.
    exit /b 1
)
"%MYSQL_BIN%mysql" -u%DB_USER% -p%DB_PASS% -e "SELECT 1" >nul 2>&1
if errorlevel 1 (
    echo ERROR: no se puede conectar a MySQL. Comprueba que esta en marcha y la clave.
    exit /b 1
)
"%MYSQL_BIN%mysql" -u%DB_USER% -p%DB_PASS% -N -e "SHOW DATABASES LIKE '%DB_NAME%'" 2>nul | findstr /i "%DB_NAME%" >nul
if errorlevel 1 (
    echo La BD no existe en este PC. Restaurando desde la copia, tarda unos minutos...
    "%MYSQL_BIN%mysql" -u%DB_USER% -p%DB_PASS% --max_allowed_packet=256M --default-character-set=utf8mb4 < "%COPIA%"
    if errorlevel 1 (
        echo ERROR al restaurar la BD.
        exit /b 1
    )
    echo BD restaurada.
) else (
    echo La BD ya existe, no hace falta restaurarla.
)
set "JAR="
for %%f in ("%BACK%\target\*.jar") do set "JAR=%%f"
if not defined JAR (
    echo No se encuentra el jar del backend. Haz primero la opcion 1.
    exit /b 1
)
echo Arrancando el backend...
start "Backend JAMAJO" java -jar "%JAR%"
echo Esperando 15 segundos a que arranque...
timeout /t 15 /nobreak >nul
start "" "%FRONT%"
echo Listo. No cierres la ventana negra del backend mientras uses la web.
exit /b 0
