/**
 * Script para asignar plataformas aleatorias a películas y series
 * Cada película/serie tendrá entre 1 y 3 plataformas asignadas
 */

const mysql = require("mysql2/promise");

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "popflix",
};

const PLATFORMS = [
  { id: 1, name: "Netflix" },
  { id: 2, name: "Prime Video" },
  { id: 3, name: "Disney+" },
  { id: 4, name: "HBO Max" },
  { id: 5, name: "Hulu" },
  { id: 6, name: "Paramount+" },
  { id: 7, name: "Apple TV+" },
];

// Función para obtener plataformas aleatorias (1-3)
function getRandomPlatforms() {
  const count = Math.floor(Math.random() * 3) + 1; // 1 a 3 plataformas
  const shuffled = [...PLATFORMS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

async function assignPlatforms() {
  const connection = await mysql.createConnection(dbConfig);
  
  try {
    console.log("🎬 Asignando plataformas a películas y series...\n");
    
    // Limpiar tablas de relaciones existentes
    console.log("🧹 Limpiando relaciones anteriores...");
    await connection.execute("DELETE FROM movie_platforms");
    await connection.execute("DELETE FROM series_platforms");
    
    // Obtener todas las películas
    const [movies] = await connection.execute("SELECT id, title FROM movies");
    console.log(`\n📽️  Asignando plataformas a ${movies.length} películas...`);
    
    let moviePlatformsCount = 0;
    for (const movie of movies) {
      const platforms = getRandomPlatforms();
      for (const platform of platforms) {
        await connection.execute(
          "INSERT INTO movie_platforms (movie_id, platform_id) VALUES (?, ?)",
          [movie.id, platform.id]
        );
        moviePlatformsCount++;
      }
    }
    console.log(`✅ Insertadas ${moviePlatformsCount} relaciones película-plataforma`);
    
    // Verificar si existe la tabla series_platforms
    const [tables] = await connection.execute(
      "SHOW TABLES LIKE 'series_platforms'"
    );
    
    if (tables.length > 0) {
      // Obtener todas las series
      const [series] = await connection.execute("SELECT id, title FROM series");
      console.log(`\n📺 Asignando plataformas a ${series.length} series...`);
      
      let seriesPlatformsCount = 0;
      for (const serie of series) {
        const platforms = getRandomPlatforms();
        for (const platform of platforms) {
          await connection.execute(
            "INSERT INTO series_platforms (series_id, platform_id) VALUES (?, ?)",
            [serie.id, platform.id]
          );
          seriesPlatformsCount++;
        }
      }
      console.log(`✅ Insertadas ${seriesPlatformsCount} relaciones serie-plataforma`);
    } else {
      console.log("\n⚠️  Tabla series_platforms no encontrada, creándola...");
      await connection.execute(`
        CREATE TABLE IF NOT EXISTS series_platforms (
          id INT AUTO_INCREMENT PRIMARY KEY,
          series_id INT NOT NULL,
          platform_id INT NOT NULL,
          FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
          FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
          UNIQUE KEY unique_series_platform (series_id, platform_id)
        )
      `);
      
      const [series] = await connection.execute("SELECT id, title FROM series");
      console.log(`📺 Asignando plataformas a ${series.length} series...`);
      
      let seriesPlatformsCount = 0;
      for (const serie of series) {
        const platforms = getRandomPlatforms();
        for (const platform of platforms) {
          await connection.execute(
            "INSERT INTO series_platforms (series_id, platform_id) VALUES (?, ?)",
            [serie.id, platform.id]
          );
          seriesPlatformsCount++;
        }
      }
      console.log(`✅ Insertadas ${seriesPlatformsCount} relaciones serie-plataforma`);
    }
    
    // Resumen final
    console.log("\n" + "=".repeat(50));
    console.log("📊 RESUMEN FINAL");
    console.log("=".repeat(50));
    
    const [moviePlatformStats] = await connection.execute(`
      SELECT p.name, COUNT(*) as count 
      FROM movie_platforms mp 
      JOIN platforms p ON mp.platform_id = p.id 
      GROUP BY p.id 
      ORDER BY count DESC
    `);
    
    console.log("\n🎬 Películas por plataforma:");
    moviePlatformStats.forEach(stat => {
      console.log(`   ${stat.name}: ${stat.count}`);
    });
    
    const [seriesPlatformStats] = await connection.execute(`
      SELECT p.name, COUNT(*) as count 
      FROM series_platforms sp 
      JOIN platforms p ON sp.platform_id = p.id 
      GROUP BY p.id 
      ORDER BY count DESC
    `);
    
    console.log("\n📺 Series por plataforma:");
    seriesPlatformStats.forEach(stat => {
      console.log(`   ${stat.name}: ${stat.count}`);
    });
    
    console.log("\n✅ ¡Asignación de plataformas completada!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

assignPlatforms();
