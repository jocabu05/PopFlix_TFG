const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'popflix'
    });

    console.log('\n=== VERIFICACIÓN DE BASE DE DATOS ===\n');

    // 1. Total de películas
    const [movies] = await connection.query('SELECT COUNT(*) as count FROM movies');
    console.log(`✅ Total de películas: ${movies[0].count}`);

    // 2. Total en movies_platforms
    const [mpCount] = await connection.query('SELECT COUNT(*) as count FROM movies_platforms');
    console.log(`✅ Total en movies_platforms: ${mpCount[0].count}`);

    // 3. Plataformas disponibles
    const [platforms] = await connection.query('SELECT id, name FROM platforms');
    console.log(`✅ Plataformas: ${platforms.map(p => `${p.id}=${p.name}`).join(', ')}`);

    // 4. User 2 - qué plataformas tiene seleccionadas
    const [userPlatforms] = await connection.query(
      'SELECT platform_id FROM user_platforms WHERE user_id = 2'
    );
    console.log(`✅ Plataformas de usuario 2: ${userPlatforms.map(p => p.platform_id).join(', ') || 'NINGUNA'}`);

    // 5. Muestra de películas por plataforma
    for (let i = 1; i <= 4; i++) {
      const [count] = await connection.query(
        'SELECT COUNT(*) as count FROM movies_platforms WHERE platform_id = ?',
        [i]
      );
      console.log(`✅ Películas en plataforma ${i}: ${count[0].count}`);
    }

    // 6. Primeras películas
    const [sampleMovies] = await connection.query(
      'SELECT id, title FROM movies ORDER BY id LIMIT 5'
    );
    console.log(`\n✅ Primeras 5 películas:`);
    sampleMovies.forEach(m => console.log(`   - [${m.id}] ${m.title}`));

    // 7. Verificar si hay datos en movies_platforms
    const [sampleMP] = await connection.query(
      'SELECT movie_id, platform_id FROM movies_platforms LIMIT 5'
    );
    console.log(`\n✅ Primeros 5 en movies_platforms:`);
    if (sampleMP.length > 0) {
      sampleMP.forEach(mp => console.log(`   - Movie ${mp.movie_id} -> Platform ${mp.platform_id}`));
    } else {
      console.log('   ⚠️  TABLA VACÍA');
    }

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
