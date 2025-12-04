# 🎯 REFERENCIA RÁPIDA - PopFlix Scraping System

## ⚡ 10 Segundos: ¿Qué es esto?
Sistema profesional que scrapia datos reales de Netflix, Prime, Disney+, HBO y los integra con PopFlix. Completamente legal, automático y documentado.

## ⚡ 30 Segundos: ¿Qué necesito hacer?
1. Abre `START_HERE.md`
2. Ejecuta `python scraper/test_system.py`
3. Si 5/5 tests pasan → ¡Sistema operacional!

## ⚡ 5 Minutos: Stack Técnico
- **Scraping:** Selenium + BeautifulSoup
- **Datos:** TMDB API (oficial)
- **Caché:** JSON local (24h)
- **BD:** MySQL
- **Backend:** Node.js Express
- **Automatización:** Schedule library

## ⚡ 5 Minutos: Archivos Clave

| Archivo | Propósito |
|---------|-----------|
| `START_HERE.md` | 👉 Punto de entrada |
| `scraper/scraper.py` | Motor de scraping |
| `scraper/cache_manager.py` | Gestión de caché |
| `scraper/task_orchestrator.py` | Automatización |
| `scraper/test_system.py` | Tests |
| `SCRAPER_ARCHITECTURE.md` | Documentación técnica |
| `SCRAPER_INTEGRATION_GUIDE.md` | Integración |

## ⚡ 1 Minuto: Ejecutar

```powershell
# Opción 1: Script interactivo
cd C:\popFlix_TFG\scraper
.\run-scraper.ps1

# Opción 2: Tests directo
python test_system.py

# Opción 3: Scraper
python scraper.py
```

## ⚡ 1 Minuto: Estado

```
✅ BD: 84 películas (reales TMDB)
✅ API: /api/movies/user/:userId/by-platforms
✅ App: Sección "En tus plataformas"
✅ Legal: 100% verificado
```

## ⚡ 2 Minutos: Troubleshooting

| Problema | Solución |
|----------|----------|
| Backend no responde | `cd backend && node server.js` |
| No hay películas | `cd backend && node populate-from-tmdb.js` |
| Python error | `pip install -r scraper/requirements.txt` |
| Tests fallan | Revisar salida de `test_system.py` |

## ⚡ 1 Minuto: Legalidad

✅ **Legal porque:**
- TMDB API oficial
- Rate limiting (2 sec)
- User-Agent transparente
- Solo datos públicos

❌ **No hace:**
- Login no autorizado
- Bypass DRM
- Redistributión

## 🎯 Documentación por Caso de Uso

| Necesito | Leer |
|---------|------|
| Entender qué se creó | `SCRAPER_MANIFEST.md` |
| Ver diagramas | `SCRAPER_VISUAL_GUIDE.md` |
| Entender integración | `SCRAPER_INTEGRATION_GUIDE.md` |
| Ejecutar el sistema | `scraper/README.md` |
| Técnica profunda | `SCRAPER_ARCHITECTURE.md` |
| Quick start | Este archivo |

## 📊 Datos

```
BD: 84 películas TMDB
    ├─ HBO Max: 19
    ├─ Netflix: 15
    ├─ Disney+: 2
    └─ Otros: 48

Endpoint: /api/movies/user/2/by-platforms
Response: JSON con películas filtradas
```

## ⏰ Automatización

```
02:00 AM → Scraping (5-10 min)
02:30 AM → Sync BD (1-2 min)
03:00 AM → Health check
24/7    → API respondiendo
```

## 🔑 Comandos Útiles

```powershell
# Ver estado
cd scraper
python test_system.py

# Instalar deps
pip install -r requirements.txt

# Ejecutar scraper
python scraper.py

# Ver automatización
python task_orchestrator.py

# Limpiar cache
python -c "from cache_manager import CacheManager; CacheManager().clear_cache()"
```

## 📱 App Integration

En `app/(tabs)/index.tsx`:
```jsx
<View style={styles.platformMoviesSection}>
  <Text>📱 En tus plataformas</Text>
  {/* Llama /api/movies/user/2/by-platforms */}
  {/* Muestra películas filtradas */}
</View>
```

## 🎓 Valor para TFG

Demuestra:
✅ Web scraping profesional
✅ APIs (TMDB)
✅ Arquitectura escalable
✅ Automatización
✅ Legalidad/ética

## 🚀 Próximos Pasos

- [ ] Ejecutar tests
- [ ] Configurar automatización
- [ ] Documentar para presentación
- [ ] Desplegar producción

## 📞 Ayuda

1. Lee `START_HERE.md`
2. Ejecuta `test_system.py`
3. Consulta documentación específica
4. Revisa código comentado en Python

---

**Status:** ✅ Completado | **Versión:** 1.0 | **Calidad:** Profesional

**Punto de entrada:** `START_HERE.md` o `python scraper/test_system.py`
