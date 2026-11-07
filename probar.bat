@echo off
rem Prueba Parcialito en tu compu: valida los temas, levanta un servidor local y abre el navegador.
rem Cortalo con Ctrl+C. Necesita Python instalado (el mismo que usa update.bat).
chcp 65001 >nul
cd /d "%~dp0"

where python >nul 2>nul
if %errorlevel%==0 (
  python tools\servidor_local.py
) else (
  py tools\servidor_local.py
)

if errorlevel 1 (
  echo.
  echo Algo fallo. Fijate que Python este instalado ^(python.org^) y volve a probar.
)
pause
