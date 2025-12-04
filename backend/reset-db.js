const mysql = require('mysql2/promise');

async function resetDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'popflix'
  });

  try {
    console.log('🔄 RESET COMPLETO DE BD...\n');
    
    // Disable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    
    // Drop and recreate tables
    console.log('🗑️  Borrando tablas...');
    await connection.query('DROP TABLE IF EXISTS movies_platforms');
    await connection.query('DROP TABLE IF EXISTS movie_genres');
    await connection.query('DROP TABLE IF EXISTS movies');
    
    console.log('✅ Tablas borradas');
    
    // Recreate tables
    console.log('📋 Recreando tablas...');
    await connection.query(`
      CREATE TABLE movies (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tmdb_id INT UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description LONGTEXT,
        poster_url VARCHAR(500),
        backdrop_url VARCHAR(500),
        release_date DATE,
        rating DECIMAL(3, 1),
        popularity DECIMAL(8, 2),
        runtime INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    
    await connection.query(`
      CREATE TABLE movie_genres (
        id INT AUTO_INCREMENT PRIMARY KEY,
        movie_id INT NOT NULL,
        genre_id INT NOT NULL,
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        UNIQUE KEY unique_movie_genre (movie_id, genre_id)
      )
    `);
    
    await connection.query(`
      CREATE TABLE movies_platforms (
        id INT AUTO_INCREMENT PRIMARY KEY,
        movie_id INT NOT NULL,
        platform_id INT NOT NULL,
        FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
        FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
        UNIQUE KEY unique_movie_platform (movie_id, platform_id)
      )
    `);
    
    console.log('✅ Tablas recreadas\n');
    
    // Re-enable foreign key checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('✅ Reset completado exitosamente');
    await connection.end();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetDatabase();
