"""
Orquestador de tareas automáticas de scraping
Demuestra: Automatización, scheduling, logging centralizado
"""

import schedule
import time
import logging
from datetime import datetime
from typing import Callable

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - [%(levelname)s] - %(message)s'
)
logger = logging.getLogger(__name__)


class TaskOrchestrator:
    """
    Orquestador de tareas de scraping automáticas
    Ejecuta: Scraping, sincronización de BD, limpieza de caché
    """
    
    def __init__(self):
        """Inicializar orquestador"""
        self.tasks = []
        self.last_run = {}
    
    def schedule_task(
        self,
        name: str,
        func: Callable,
        interval: str = 'daily',
        time_str: str = '02:00'
    ):
        """
        Programar tarea automática
        
        Args:
            name: Nombre de la tarea
            func: Función a ejecutar
            interval: 'daily', 'hourly', 'weekly'
            time_str: Hora (HH:MM) para ejecución
        """
        logger.info(f"📅 Programando: {name} ({interval} @ {time_str})")
        
        task_entry = {
            'name': name,
            'func': func,
            'interval': interval,
            'time': time_str
        }
        self.tasks.append(task_entry)
        
        # Registrar en schedule
        if interval == 'daily':
            schedule.every().day.at(time_str).do(self._run_task, name, func)
        elif interval == 'hourly':
            schedule.every().hour.do(self._run_task, name, func)
        elif interval == 'weekly':
            schedule.every().week.at(time_str).do(self._run_task, name, func)
    
    def _run_task(self, name: str, func: Callable):
        """Ejecutar tarea con logging"""
        logger.info(f"\n{'='*60}")
        logger.info(f"▶️  EJECUTANDO TAREA: {name}")
        logger.info(f"{'='*60}")
        
        try:
            func()
            self.last_run[name] = datetime.now()
            logger.info(f"✅ TAREA COMPLETADA: {name}")
        except Exception as e:
            logger.error(f"❌ ERROR EN TAREA {name}: {str(e)}")
    
    def start(self):
        """Iniciar scheduler en modo daemon"""
        logger.info(f"\n{'🚀 '*30}")
        logger.info(f"INICIANDO ORQUESTADOR DE TAREAS")
        logger.info(f"{'🚀 '*30}")
        logger.info(f"Tareas programadas: {len(self.tasks)}")
        
        for task in self.tasks:
            logger.info(f"  • {task['name']} ({task['interval']} @ {task['time']})")
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)  # Verificar cada minuto
        except KeyboardInterrupt:
            logger.info("\n⏹️  Orquestador detenido")
    
    def get_status(self) -> dict:
        """Obtener estado del orquestador"""
        return {
            'total_tasks': len(self.tasks),
            'tasks': [
                {
                    'name': t['name'],
                    'interval': t['interval'],
                    'last_run': self.last_run.get(t['name']).isoformat()
                    if t['name'] in self.last_run else 'Never'
                }
                for t in self.tasks
            ]
        }


class ScheduleConfig:
    """Configuración recomendada de schedule para PopFlix"""
    
    @staticmethod
    def get_recommended_schedule() -> dict:
        """
        Obtener configuración recomendada de tareas
        """
        return {
            'scraping': {
                'name': 'Scraping automático de plataformas',
                'interval': 'daily',
                'time': '02:00',
                'description': 'Ejecuta a las 2 AM (horas bajas de tráfico)'
            },
            'sync': {
                'name': 'Sincronización con BD',
                'interval': 'daily',
                'time': '02:30',
                'description': 'Después del scraping, sincroniza cambios'
            },
            'cache_cleanup': {
                'name': 'Limpieza de caché',
                'interval': 'weekly',
                'time': 'Sunday 03:00',
                'description': 'Limpia caché antigua cada domingo'
            },
            'health_check': {
                'name': 'Verificación de salud',
                'interval': 'hourly',
                'time': 'Every hour',
                'description': 'Verifica conectividad con plataformas'
            }
        }


def demo_scrape_task():
    """Tarea demo: Scraping"""
    logger.info("  📺 Iniciando scraping de plataformas...")
    logger.info("  • Netflix: ✅ 200 películas")
    logger.info("  • Prime Video: ✅ 180 películas")
    logger.info("  • Disney+: ✅ 150 películas")
    logger.info("  • HBO Max: ✅ 160 películas")
    logger.info("  Total: 690 títulos")
    time.sleep(2)


def demo_sync_task():
    """Tarea demo: Sincronización"""
    logger.info("  🔄 Sincronizando con BD MySQL...")
    logger.info("  • Nuevas películas: 45")
    logger.info("  • Plataformas actualizadas: 120")
    logger.info("  • Eliminadas (no disponibles): 8")
    time.sleep(1)


def demo_health_check():
    """Tarea demo: Health check"""
    logger.info("  💓 Verificando salud del sistema...")
    logger.info("  • BD MySQL: ✅ Conectada")
    logger.info("  • APIs externas: ✅ Disponibles")
    logger.info("  • Caché: ✅ Optimizado")


def main():
    """
    Demo del sistema de automatización
    """
    logger.info("\n" + "="*60)
    logger.info("SISTEMA DE AUTOMATIZACIÓN - POPFLIX TFG")
    logger.info("="*60)
    
    # Mostrar configuración recomendada
    logger.info("\n📋 CONFIGURACIÓN RECOMENDADA:")
    schedule_config = ScheduleConfig.get_recommended_schedule()
    for key, config in schedule_config.items():
        logger.info(f"\n  {key.upper()}:")
        logger.info(f"    • Nombre: {config['name']}")
        logger.info(f"    • Intervalo: {config['interval']}")
        logger.info(f"    • Hora: {config['time']}")
        logger.info(f"    • Descripción: {config['description']}")
    
    # En producción, descomentar para ejecutar scheduler:
    # orchestrator = TaskOrchestrator()
    # orchestrator.schedule_task('Scraping', demo_scrape_task, 'daily', '02:00')
    # orchestrator.schedule_task('Sincronización', demo_sync_task, 'daily', '02:30')
    # orchestrator.schedule_task('Health Check', demo_health_check, 'hourly')
    # orchestrator.start()
    
    # Demo de tareas
    logger.info("\n" + "🎬 "*30)
    logger.info("EJECUTANDO DEMO DE TAREAS (SIMULADO)")
    logger.info("🎬 "*30)
    
    logger.info("\n[1/3] Ejecutando scraping...")
    demo_scrape_task()
    
    logger.info("\n[2/3] Ejecutando sincronización...")
    demo_sync_task()
    
    logger.info("\n[3/3] Ejecutando health check...")
    demo_health_check()
    
    logger.info("\n" + "✅ "*30)
    logger.info("SISTEMA DE AUTOMATIZACIÓN OPERACIONAL")
    logger.info("✅ "*30)
    logger.info("\nEn producción con schedule ejecutado como servicio:")
    logger.info("  • Windows Service: Usar NSSM (Non-Sucking Service Manager)")
    logger.info("  • Linux: Usar systemd service")
    logger.info("  • Docker: Contenedor con scheduler incluido")


if __name__ == "__main__":
    main()
