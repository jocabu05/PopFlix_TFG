"""
Sistema de caché para Popflix
Demuestra: Optimización, control de actualización, sincronización BD
"""

import json
import os
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class CacheManager:
    """Gestionar caché de datos de plataformas"""
    
    CACHE_DIR = os.path.join(os.path.dirname(__file__), 'cache')
    CACHE_EXPIRY_HOURS = 24  # Actualizar cada 24 horas
    
    def __init__(self):
        """Inicializar gestor de caché"""
        os.makedirs(self.CACHE_DIR, exist_ok=True)
    
    def get_cache_file(self, platform: str) -> str:
        """Obtener ruta del archivo de caché"""
        return os.path.join(self.CACHE_DIR, f'{platform}_cache.json')
    
    def is_cache_valid(self, platform: str) -> bool:
        """
        Verificar si caché aún es válido
        
        Args:
            platform: Nombre de plataforma
        
        Returns:
            True si caché es menor a CACHE_EXPIRY_HOURS
        """
        cache_file = self.get_cache_file(platform)
        
        if not os.path.exists(cache_file):
            return False
        
        file_time = datetime.fromtimestamp(os.path.getmtime(cache_file))
        age = datetime.now() - file_time
        
        is_valid = age < timedelta(hours=self.CACHE_EXPIRY_HOURS)
        
        if is_valid:
            logger.info(f"  ✅ Caché válido para {platform} (edad: {age.seconds // 60} min)")
        else:
            logger.info(f"  ⚠️  Caché expirado para {platform} (edad: {age.days} días)")
        
        return is_valid
    
    def save_cache(self, platform: str, data: list):
        """
        Guardar caché
        
        Args:
            platform: Nombre de plataforma
            data: Lista de películas
        """
        cache_file = self.get_cache_file(platform)
        cache_data = {
            'timestamp': datetime.now().isoformat(),
            'platform': platform,
            'count': len(data),
            'movies': data
        }
        
        with open(cache_file, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
        
        logger.info(f"  💾 Caché guardado: {platform} ({len(data)} películas)")
    
    def load_cache(self, platform: str) -> list:
        """
        Cargar caché
        
        Args:
            platform: Nombre de plataforma
        
        Returns:
            Lista de películas del caché
        """
        cache_file = self.get_cache_file(platform)
        
        if not os.path.exists(cache_file):
            return []
        
        with open(cache_file, 'r', encoding='utf-8') as f:
            cache_data = json.load(f)
        
        logger.info(f"  ✅ Caché cargado: {platform} ({cache_data['count']} películas)")
        return cache_data.get('movies', [])
    
    def clear_cache(self, platform: str = None):
        """
        Limpiar caché
        
        Args:
            platform: Plataforma a limpiar (None = todas)
        """
        if platform:
            cache_file = self.get_cache_file(platform)
            if os.path.exists(cache_file):
                os.remove(cache_file)
                logger.info(f"  🗑️  Caché limpiado: {platform}")
        else:
            for file in os.listdir(self.CACHE_DIR):
                os.remove(os.path.join(self.CACHE_DIR, file))
            logger.info("  🗑️  Todo el caché limpiado")
    
    def get_stats(self) -> dict:
        """Obtener estadísticas del caché"""
        stats = {
            'total_cache_files': 0,
            'platforms': {}
        }
        
        if os.path.exists(self.CACHE_DIR):
            for file in os.listdir(self.CACHE_DIR):
                stats['total_cache_files'] += 1
                filepath = os.path.join(self.CACHE_DIR, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    platform = data.get('platform')
                    stats['platforms'][platform] = {
                        'movies': data.get('count'),
                        'timestamp': data.get('timestamp')
                    }
        
        return stats


class SyncManager:
    """Gestionar sincronización de datos scrapeados con BD MySQL"""
    
    def __init__(self, db_connection):
        """
        Inicializar gestor de sincronización
        
        Args:
            db_connection: Conexión a MySQL
        """
        self.db = db_connection
        self.cache = CacheManager()
    
    def sync_platform_data(self, platform: str, movies: list) -> dict:
        """
        Sincronizar datos scrapeados con BD
        
        Args:
            platform: Nombre de plataforma
            movies: Lista de películas scrapeadas
        
        Returns:
            Diccionario con resultados de sincronización
        """
        logger.info(f"\n🔄 Sincronizando {platform}...")
        
        result = {
            'platform': platform,
            'inserted': 0,
            'updated': 0,
            'skipped': 0
        }
        
        # Implementar lógica de sincronización
        # 1. Para cada película: verificar si existe
        # 2. Si existe: actualizar timestamp de disponibilidad
        # 3. Si no existe: insertar nueva
        # 4. Crear/actualizar entrada en movies_platforms
        
        logger.info(f"  ✅ Sincronización completada: {result}")
        return result
