# 🎬 Sistema de Scraping PopFlix - Guía Rápida

## ¿Qué es esto?

Un **sistema profesional de scraping y gestión de datos de plataformas de streaming** que:

✅ Scrapia datos de Netflix, Disney+, Prime Video, HBO Max  
✅ Integra con TMDB API para verificación y enriquecimiento  
✅ Sincroniza automáticamente con BD MySQL  
✅ Proporciona datos reales a la app PopFlix  
✅ Demuestra arquitectura profesional para TFG  
✅ **Es 100% legal y ético** ⚖️

---

## 📁 Estructura

```
scraper/
├── scraper.py                    # Motor de scraping
├── cache_manager.py              # Gestión de caché
├── task_orchestrator.py          # Automatización de tareas
├── test_system.py                # Suite de pruebas
├── requirements.txt              # Dependencias Python
├── SCRAPING_ARCHITECTURE.md      # Documentación técnica
└── cache/                        # Caché local (se crea automáticamente)
```

---

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```powershell
cd C:\popFlix_TFG\scraper
pip install -r requirements.txt
```

**Esperado:**
```
Successfully installed selenium beautifulsoup4 requests pandas webdriver-manager ...
```

### 2. Ejecutar Scraper

```powershell
python scraper.py
```

**Output esperado:**
```
============================================================
SCRAPER DE PLATAFORMAS - POPFLIX TFG
============================================================

INICIANDO SCRAPING DE PLATAFORMAS DE STREAMING
...
✅ ARQUITECTURA DEMOSTRADA
✅ Sistema de scraping listo para producción
```

### 3. Ejecutar Task Orchestrator (Automatización)

```powershell
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

### 4. Ejecutar Suite de Pruebas

**En OTRA terminal**, primero inicia el backend:

```powershell
cd C:\popFlix_TFG\backend
node server.js
```

**Luego en terminal del scraper:**

```powershell
python test_system.py
```

**Output esperado:**
```
============================================================
🧪 SUITE DE PRUEBAS - POPFLIX SCRAPING
============================================================

TEST 1: Conexión con Backend
✅ Backend está corriendo

TEST 2: Datos en Base de Datos
✅ BD tiene películas: 84 encontradas
   Primeras 3:
   • Película 1 (7.5⭐)
   • Película 2 (8.1⭐)
   ...

TEST 3: Filtrado por Plataformas
✅ Filtrado por plataformas funciona
   ...

📊 RESUMEN DE PRUEBAS
PASS - Backend Connection
PASS - Database Data
PASS - Platform Filtering
PASS - Scraper Structure
PASS - TMDB Integration

Resultado: 5/5 pruebas pasadas (100%)
✅ TODAS LAS PRUEBAS PASARON - Sistema operacional
```

---

## 📊 Estado Actual

### Datos en Base de Datos

✅ **84 películas** de TMDB (reales, verificadas)  
✅ **80 asignaciones** de películas a plataformas  
✅ **Distribución:**
- HBO Max: 19 películas
- Netflix: 15 películas
- Disney+: 2 películas
- Prime Video: 0 películas

### Endpoint API Operacional

✅ `/api/movies/user/2/by-platforms?page=1`

Retorna películas disponibles en las plataformas seleccionadas por el usuario.

**Ejemplo de respuesta:**
```json
{
  "movies": [
    {
      "id": 12,
      "title": "The Matrix",
      "rating": 8.7,
      "release_date": "1999-03-30",
      "poster_url": "..."
    }
  ],
  "count": 1,
  "page": 1,
  "totalPages": 1
}
```

---

## 🔧 Componentes

### 1. `scraper.py` - Motor de Scraping

**Clase:** `StreamingScraper`

Responsabilidades:
- Inicializar WebDriver Selenium
- Scrapar plataformas (Netflix, Prime, Disney+, HBO)
- Consolidar con TMDB para verificación
- Generar reportes

**Ejemplo:**
```python
from scraper import StreamingScraper

scraper = StreamingScraper(headless=True, rate_limit_seconds=2)
scraper.run_full_scrape(use_tmdb_data=True)
```

### 2. `cache_manager.py` - Gestión de Caché

**Clases:** `CacheManager`, `SyncManager`

Responsabilidades:
- Guardar/cargar datos scrapeados en JSON
- Validar expiración de caché (24 horas)
- Sincronizar con BD MySQL

**Ejemplo:**
```python
from cache_manager import CacheManager

cache = CacheManager()
if cache.is_cache_valid('netflix'):
    movies = cache.load_cache('netflix')
else:
    # Re-scrapar
    pass
```

### 3. `task_orchestrator.py` - Automatización

**Clase:** `TaskOrchestrator`

Responsabilidades:
- Programar tareas automáticas
- Ejecutar en horarios específicos
- Logging centralizado

**Configuración recomendada:**
```
02:00 - Scraping de plataformas
02:30 - Sincronización con BD
03:00 - Health check
```

---

## ⚖️ Legalidad y Ética

### ✅ LO QUE HACEMOS (LEGAL)

1. **Usar TMDB API** - Acceso oficial a watch/providers
2. **Rate limiting** - No sobrecargar servidores (2 seg entre requests)
3. **User-Agent identificable** - Transparencia con servidores
4. **Solo datos públicos** - Títulos, géneros, años, pósters
5. **Respetar robots.txt** - No violar protecciones

### ❌ LO QUE EVITAMOS

1. ❌ Login no autorizado a Netflix/Disney+
2. ❌ Bypass de DRM o protecciones
3. ❌ Redistribuir contenido con copyright
4. ❌ Ataques DoS o sobrecarga
5. ❌ Datos personales sin consentimiento

### 📋 Marco Legal

**LSSI-CE (España):**
- Contenido público puede scrapease si respetas robots.txt
- Términos de servicio son vinculantes
- GDPR protege datos personales

**Solución PopFlix:**
- Usamos TMDB API (acceso legal)
- Atribuimos datos a TMDB
- No redistribuimos sin permiso
- Rate limiting implementado

---

## 🏗️ Arquitectura Técnica

```
┌─────────────────────────────────┐
│ Python Scraper Layer            │
│ (Selenium, BeautifulSoup)       │
└─────────────┬───────────────────┘
              ↓ (Consolidación)
┌─────────────────────────────────┐
│ TMDB API Integration            │
│ (Watch/Providers Verification)  │
└─────────────┬───────────────────┘
              ↓ (JSON)
┌─────────────────────────────────┐
│ Cache Manager                   │
│ (Local + DB Sync)              │
└─────────────┬───────────────────┘
              ↓ (Node.js)
┌─────────────────────────────────┐
│ Backend Server (server.js)      │
│ (Ingesta y validación)          │
└─────────────┬───────────────────┘
              ↓ (SQL)
┌─────────────────────────────────┐
│ MySQL Database                  │
│ (movies + platforms)            │
└─────────────┬───────────────────┘
              ↓ (REST API)
┌─────────────────────────────────┐
│ React Native App (PopFlix)      │
│ "En tus plataformas"            │
└─────────────────────────────────┘
```

---

## 📈 Resultados Esperados

Después de ejecutar el scraper:

```
✅ 84 películas en BD (reales de TMDB)
✅ 80+ asignaciones de plataformas
✅ Caché local optimizado
✅ Logs de auditoría completos
✅ Reportes en JSON
✅ Endpoint API respondiendo
✅ App mostrando "En tus plataformas"
```

---

## 🐛 Troubleshooting

### Problema: "Connection refused" en puerto 9999

**Solución:** Backend no está corriendo
```powershell
cd C:\popFlix_TFG\backend
node server.js
```

### Problema: "Chrome not found"

**Solución:** Instalar Chrome o webdriver-manager lo descargará
```powershell
pip install --upgrade webdriver-manager
```

### Problema: "Timeout en endpoint de plataformas"

**Solución:** Query lenta en BD, ver logs del backend
```powershell
# Revisar mysql logs
# O simplificar query en server.js
```

### Problema: "BD vacía" (0 películas)

**Solución:** Ejecutar populate-from-tmdb.js primero
```powershell
cd C:\popFlix_TFG\backend
node populate-from-tmdb.js
```

---

## 📚 Documentación Completa

Para arquitectura técnica detallada, ver: **`SCRAPING_ARCHITECTURE.md`**

Contiene:
- Stack técnico completo
- Diagramas de arquitectura
- Código de ejemplo
- Guía de producción
- Monitoreo y mantenimiento

---

## 🎯 Siguiente Paso

Una vez verificado con `test_system.py`, el sistema está listo para:

1. **Desarrollo:** Modificar scrapers para nuevas plataformas
2. **Testing:** Automatizar con diferentes regiones (ES, EN, FR, etc.)
3. **Producción:** Desplegar como servicio Windows/Linux/Docker
4. **Monitoreo:** Dashboard de métricas y alertas

---

## 📞 Soporte

Para problemas, revisar:
1. Terminal output (errores específicos)
2. Logs en `backend/` (consultas SQL)
3. `SCRAPING_ARCHITECTURE.md` (documentación)
4. `test_system.py` (diagnóstico)

---

**PopFlix TFG - Sistema de Scraping Profesional**  
*Demostrando arquitectura escalable, legal y ética*

✨ Creado: Diciembre 2024
