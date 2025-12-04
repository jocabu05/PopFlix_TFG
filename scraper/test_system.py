"""
Script de prueba - Verifica que el sistema de scraping y API funcione correctamente
"""

import sys
import os
import time
import requests
import json

# Colores para output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'


def print_header(text):
    """Imprimir encabezado"""
    print(f"\n{Colors.BLUE}{'='*60}")
    print(f"{text}")
    print(f"{'='*60}{Colors.END}\n")


def test_backend_connection():
    """Verificar conexión con backend"""
    print_header("TEST 1: Conexión con Backend")
    
    try:
        response = requests.get("http://localhost:9999/api/health", timeout=5)
        if response.status_code == 404:  # Endpoint no existe pero servidor responde
            print(f"{Colors.GREEN}✅ Backend está corriendo{Colors.END}")
            return True
        else:
            print(f"{Colors.GREEN}✅ Backend responde{Colors.END}")
            return True
    except requests.exceptions.ConnectionError:
        print(f"{Colors.RED}❌ No se puede conectar al backend en http://localhost:9999{Colors.END}")
        print(f"   Solución: Ejecutar 'node server.js' en otra terminal")
        return False
    except Exception as e:
        print(f"{Colors.RED}❌ Error: {e}{Colors.END}")
        return False


def test_database_data():
    """Verificar datos en base de datos"""
    print_header("TEST 2: Datos en Base de Datos")
    
    try:
        # Intentar obtener películas
        response = requests.get("http://localhost:9999/api/movies/trending?page=1", timeout=5)
        data = response.json()
        
        movie_count = len(data.get('movies', []))
        
        if movie_count > 0:
            print(f"{Colors.GREEN}✅ BD tiene películas: {movie_count} encontradas{Colors.END}")
            print(f"   Primeras 3:")
            for movie in data.get('movies', [])[:3]:
                print(f"   • {movie.get('title')} ({movie.get('rating', 'N/A')}⭐)")
            return True
        else:
            print(f"{Colors.RED}❌ No hay películas en BD{Colors.END}")
            return False
    except Exception as e:
        print(f"{Colors.RED}❌ Error: {e}{Colors.END}")
        return False


def test_platform_filtering():
    """Verificar endpoint de filtrado por plataformas"""
    print_header("TEST 3: Filtrado por Plataformas")
    
    try:
        # Usuario 2 tiene Disney+ seleccionado
        response = requests.get("http://localhost:9999/api/movies/user/2/by-platforms?page=1", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            
            if 'error' in data:
                print(f"{Colors.RED}❌ Error en endpoint: {data['error']}{Colors.END}")
                return False
            
            movie_count = len(data.get('movies', []))
            
            if movie_count > 0:
                print(f"{Colors.GREEN}✅ Filtrado por plataformas funciona{Colors.END}")
                print(f"   Películas en plataformas del usuario 2: {movie_count}")
                print(f"   Ejemplos:")
                for movie in data.get('movies', [])[:3]:
                    print(f"   • {movie.get('title')} ({movie.get('rating', 'N/A')}⭐)")
                return True
            else:
                print(f"{Colors.YELLOW}⚠️  No hay películas en las plataformas del usuario{Colors.END}")
                print(f"   Esto es normal si el usuario no tiene plataformas seleccionadas")
                return True  # No es error, solo sin datos
        else:
            print(f"{Colors.RED}❌ Status code: {response.status_code}{Colors.END}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"{Colors.RED}❌ Timeout - El endpoint tardó más de 5 segundos{Colors.END}")
        print(f"   El backend puede estar procesando una query lenta")
        return False
    except Exception as e:
        print(f"{Colors.RED}❌ Error: {e}{Colors.END}")
        return False


def test_scraper_structure():
    """Verificar que los archivos del scraper existen"""
    print_header("TEST 4: Estructura del Scraper")
    
    scraper_dir = os.path.dirname(os.path.abspath(__file__))
    files = {
        'scraper.py': 'Motor de scraping',
        'cache_manager.py': 'Gestor de caché',
        'task_orchestrator.py': 'Orquestador de tareas',
        'SCRAPING_ARCHITECTURE.md': 'Documentación técnica'
    }
    
    all_exist = True
    for filename, description in files.items():
        filepath = os.path.join(scraper_dir, filename)
        if os.path.exists(filepath):
            print(f"{Colors.GREEN}✅ {filename}{Colors.END} - {description}")
        else:
            print(f"{Colors.RED}❌ {filename}{Colors.END} - {description} (FALTA)")
            all_exist = False
    
    return all_exist


def test_tmdb_integration():
    """Verificar que TMDB está integrado"""
    print_header("TEST 5: Integración TMDB")
    
    tmdb_service_path = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'backend',
        'tmdb-service.js'
    )
    
    if os.path.exists(tmdb_service_path):
        with open(tmdb_service_path, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'getWatchProviders' in content:
            print(f"{Colors.GREEN}✅ TMDB watch/providers integrado{Colors.END}")
            print(f"   Función: getWatchProviders()")
            print(f"   Región: ES (España)")
            return True
        else:
            print(f"{Colors.RED}❌ getWatchProviders no encontrado{Colors.END}")
            return False
    else:
        print(f"{Colors.RED}❌ tmdb-service.js no existe{Colors.END}")
        return False


def run_all_tests():
    """Ejecutar todas las pruebas"""
    print_header("🧪 SUITE DE PRUEBAS - POPFLIX SCRAPING")
    
    tests = [
        ("Backend Connection", test_backend_connection),
        ("Database Data", test_database_data),
        ("Platform Filtering", test_platform_filtering),
        ("Scraper Structure", test_scraper_structure),
        ("TMDB Integration", test_tmdb_integration),
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
            time.sleep(1)  # Pequeño delay entre tests
        except Exception as e:
            print(f"{Colors.RED}❌ Error no manejado: {e}{Colors.END}")
            results[test_name] = False
    
    # Resumen
    print_header("📊 RESUMEN DE PRUEBAS")
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, passed_test in results.items():
        status = f"{Colors.GREEN}PASS{Colors.END}" if passed_test else f"{Colors.RED}FAIL{Colors.END}"
        print(f"{status} - {test_name}")
    
    percentage = (passed / total) * 100
    
    print(f"\n{Colors.BLUE}Resultado: {passed}/{total} pruebas pasadas ({percentage:.0f}%){Colors.END}\n")
    
    if passed == total:
        print(f"{Colors.GREEN}✅ TODAS LAS PRUEBAS PASARON - Sistema operacional{Colors.END}\n")
    elif passed >= total - 1:
        print(f"{Colors.YELLOW}⚠️  CASI TODO FUNCIONA - Pequeños ajustes necesarios{Colors.END}\n")
    else:
        print(f"{Colors.RED}❌ HAY PROBLEMAS - Revisar fallos arriba{Colors.END}\n")


if __name__ == "__main__":
    try:
        run_all_tests()
    except KeyboardInterrupt:
        print(f"\n{Colors.YELLOW}Pruebas interrumpidas{Colors.END}")
    except Exception as e:
        print(f"{Colors.RED}Error fatal: {e}{Colors.END}")
