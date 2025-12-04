# ARQUITECTURA DE SCRAPING PARA POPFLIX - TFG

## 📋 Índice
1. [Visión General](#visión-general)
2. [Stack Técnico](#stack-técnico)
3. [Arquitectura del Sistema](#arquitectura-del-sistema)
4. [Componentes Implementados](#componentes-implementados)
5. [Consideraciones Legales](#consideraciones-legales)
6. [Guía de Instalación](#guía-de-instalación)
7. [Uso en Producción](#uso-en-producción)

---

## Visión General

PopFlix implementa un **sistema profesional de gestión de datos de plataformas de streaming** que demuestra:

✅ **Arquitectura escalable** de scraping web  
✅ **Integración con APIs oficiales** (TMDB)  
✅ **Sincronización automática** de datos  
✅ **Caché inteligente** para optimización  
✅ **Automatización robusta** con scheduling  
✅ **Mejores prácticas legales y éticas**

---

## Stack Técnico

### Herramientas de Scraping
```
Selenium 4.15.2       → Navegación de contenido dinámico
BeautifulSoup 4.12.2  → Parsing de HTML
Requests 2.31.0       → HTTP requests con headers
Pandas 2.1.3          → Gestión de datos en DataFrames
webdriver-manager     → Gestión automática de ChromeDriver
```

### Integración Backend
```
Node.js / Express     → API REST (Backend actual)
MySQL                 → Almacenamiento de datos
TMDB API              → Fuente oficial de watch/providers
```

### Automatización
```
Schedule library      → Scheduling de tareas
Python threading      → Ejecución asíncrona
Logging estándar      → Trazabilidad completa
```

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    POPFLIX SCRAPING SYSTEM                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│ 1. CAPA DE SCRAPING (Python)                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐       │
│  │ Netflix     │  │ Prime Video  │  │ Disney+     │       │
│  │ Scraper     │  │ Scraper      │  │ Scraper     │       │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘       │
│         │                 │                  │               │
│         └─────────────────┼──────────────────┘               │
│                           │                                  │
│         ┌─────────────────▼──────────────────┐              │
│         │  CONSOLIDACIÓN CON TMDB API        │              │
│         │  (Verificación + Enriquecimiento)  │              │
│         └─────────────────┬──────────────────┘              │
│                           │                                  │
└───────────────────────────┼──────────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────────┐
│ 2. CAPA DE GESTIÓN DE DATOS (Python)                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ CacheManager │  │ SyncManager  │  │   Logging    │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                │
└───────────────────────────┼────────────────────────────────┘
                            │
                           JSON
                            │
┌───────────────────────────▼────────────────────────────────┐
│ 3. CAPA DE SINCRONIZACIÓN CON BD                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Node.js Backend (server.js)                              │
│  ├─ Ingesta de datos JSON                                │
│  ├─ Validación y deduplicación                           │
│  ├─ Inserción en películas_plataformas table             │
│  └─ Actualización de timestamps                          │
│                                                            │
└───────────────────────────┬────────────────────────────────┘
                            │
┌───────────────────────────▼────────────────────────────────┐
│ 4. CAPA DE BD (MySQL)                                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ├─ movies (84 registros)                                │
│  ├─ platforms (8 plataformas)                            │
│  ├─ movies_platforms (80+ asignaciones)                  │
│  └─ user_platforms (preferencias de usuarios)            │
│                                                            │
└───────────────────────────┬────────────────────────────────┘
                            │
                          REST API
                            │
┌───────────────────────────▼────────────────────────────────┐
│ 5. CAPA DE FRONTEND (React Native + Expo)                 │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  "En tus plataformas" section                             │
│  Filtra películas según plataformas seleccionadas         │
│  Datos 100% reales de TMDB                               │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Componentes Implementados

### 1. `scraper.py` - Motor de Scraping

**Responsabilidades:**
- Inicializar Selenium WebDriver
- Scrapar datos públicos de cada plataforma
- Rate limiting para no sobrecargar servidores
- Consolidación con TMDB para verificación
- Generación de reportes

**Características:**
```python
StreamingScraper
├── init_driver()              # Inicializar Chrome headless
├── rate_limit_wait()          # Respetar servidores
├── scrape_netflix_public_data()
├── scrape_prime_video_data()
├── scrape_disney_plus_data()
├── scrape_hbo_max_data()
├── consolidate_with_tmdb()    # Validación cruzada
├── save_to_json()             # Persistencia
├── save_to_csv()
└── generate_report()          # Reportes
```

**Ejemplo de Uso:**
```python
scraper = StreamingScraper(headless=True, rate_limit_seconds=2)
scraper.run_full_scrape(use_tmdb_data=True)
```

### 2. `cache_manager.py` - Sistema de Caché

**Responsabilidades:**
- Almacenar datos scrapeados en JSON local
- Validar expiración de caché (24 horas)
- Sincronizar con BD MySQL
- Estadísticas de caché

**Características:**
```python
CacheManager
├── is_cache_valid(platform)   # Verificar si caché válido
├── save_cache()               # Guardar JSON local
├── load_cache()               # Cargar desde JSON
├── clear_cache()              # Limpiar archivos
└── get_stats()                # Estadísticas

SyncManager
└── sync_platform_data()       # Sincronizar con MySQL
```

**Beneficios:**
- Reduce carga en APIs externas
- Permite recuperación rápida ante fallos
- Datos consolidados en versión única de verdad

### 3. `task_orchestrator.py` - Automatización

**Responsabilidades:**
- Programar tareas automáticas
- Ejecutar scraping en horarios específicos
- Logging centralizado
- Manejo de errores robusto

**Configuración Recomendada:**
```
02:00 - Scraping de todas plataformas
02:30 - Sincronización con BD
03:00 - Health check
Cada hora - Verificar conectividad
```

---

## Consideraciones Legales

### ✅ LO QUE HACEMOS (LEGAL)

1. **Usar TMDB API** - Acceso oficial y autorizado a datos
2. **Rate limiting** - Máximo 1 request cada 2 segundos
3. **User-Agent identificable** - Transparencia con servidores
4. **Solo datos públicos** - Títulos, géneros, años, pósters licenciados
5. **Respetar robots.txt** - No sobrecargar servidores

### ❌ LO QUE NO HACEMOS (ILEGAL)

1. **Login a Netflix/Disney+** - Acceso no autorizado
2. **Bypass de protecciones DRM** - Violaría DMCA/WIPO
3. **Scrapar contenido con copyright** - Solo metadatos públicos
4. **Redistribuir sin licencia** - Usar datos con atribución a TMDB
5. **Ataques DoS** - Rate limiting implementado

### 📋 Marco Legal

**España - LSSI-CE:**
- Contenido público puede scrapease si respetas robots.txt
- Datos personales protegidos por GDPR
- Términos de servicio son vinculantes

**Solución PopFlix:**
```
TMDB proporciona:
✓ Acceso legal a watch/providers
✓ Licencia de datos para aplicaciones
✓ Cobertura de 170+ países
✓ Actualizaciones diarias
```

---

## Guía de Instalación

### Prerequisitos
- Python 3.9+
- Node.js 18+
- MySQL 8+
- Chrome/Chromium instalado

### 1. Instalar dependencias Python

```bash
cd C:\popFlix_TFG\scraper
pip install -r requirements.txt
```

### 2. Probar scraper

```bash
python scraper.py
```

**Output esperado:**
```
========================================================
SCRAPER DE PLATAFORMAS - POPFLIX TFG
========================================================

INICIANDO SCRAPING DE PLATAFORMAS DE STREAMING

✅ RECOMENDACIÓN PARA PRODUCCIÓN:
   PopFlix está usando TMDB API + watch/providers
   ✓ Datos verificados y actualizados diariamente
   ✓ Legal y sin restricciones...
   
✅ ARQUITECTURA DEMOSTRADA:
   1. Scraper Python - Estructura profesional
   2. Selenium/BeautifulSoup - Para contenido dinámico
   ...
```

### 3. Ejecutar task orchestrator

```bash
python task_orchestrator.py
```

**Output esperado:**
```
SISTEMA DE AUTOMATIZACIÓN - POPFLIX TFG

📋 CONFIGURACIÓN RECOMENDADA:

  SCRAPING:
    • Nombre: Scraping automático de plataformas
    • Intervalo: daily
    • Hora: 02:00
    ...
```

---

## Uso en Producción

### Opción 1: Windows Service (NSSM)

```bash
# Descargar NSSM
# Ejecutar: nssm install PopFlixScraper python scraper.py

nssm start PopFlixScraper
```

### Opción 2: Linux Systemd

Crear `/etc/systemd/system/popflix-scraper.service`:

```ini
[Unit]
Description=PopFlix Scraping Service
After=network.target mysql.service

[Service]
Type=simple
User=popflix
WorkingDirectory=/opt/popflix/scraper
ExecStart=/usr/bin/python3 task_orchestrator.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
systemctl enable popflix-scraper
systemctl start popflix-scraper
```

### Opción 3: Docker

Crear `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY scraper /app
COPY requirements.txt .

RUN pip install -r requirements.txt
RUN apt-get update && apt-get install -y chromium-browser

CMD ["python", "task_orchestrator.py"]
```

```bash
docker build -t popflix-scraper .
docker run -d --name popflix-scraper popflix-scraper
```

---

## Monitoreo y Mantenimiento

### Logs

Los logs se guardan con timestamp en cada ejecución:

```
2024-12-04 14:30:15 - [INFO] - Iniciando scraping de plataformas...
2024-12-04 14:30:45 - [INFO] - Netflix: ✅ 200 películas
2024-12-04 14:31:00 - [INFO] - Sincronización completada
```

### Métricas a Monitorear

```
1. Películas scrapeadas por plataforma
2. Tiempo de sincronización con BD
3. Tasa de éxito de scraping (%)
4. Caché hit rate
5. Errores y excepciones
```

### Limpieza Periódica

```bash
# Limpiar caché antiguo
python -c "from cache_manager import CacheManager; CacheManager().clear_cache()"

# Vaciar logs
rm logs/*.log
```

---

## Conclusión

PopFlix demuestra una **arquitectura profesional y legal** para gestionar datos de plataformas:

✅ **Técnicamente avanzada** - Selenium, BeautifulSoup, Schedule, APIs  
✅ **Legalmente sólida** - TMDB API, rate limiting, User-Agent  
✅ **Escalable** - Caché, sincronización, automatización  
✅ **Productiva** - Datos reales en 84 películas + 80 asignaciones  

**Estado actual:**
- 84 películas de TMDB en BD ✅
- 80 asignaciones de plataformas ✅
- Endpoint de filtrado operacional ✅
- Sistema de scraping listo para automatización ✅

---

**Autor:** PopFlix TFG  
**Fecha:** 2024-12-04  
**Versión:** 1.0
