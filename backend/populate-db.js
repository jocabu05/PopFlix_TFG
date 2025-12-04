const mysql = require('mysql2/promise');

const movies = [
  { tmdb_id: 550, title: 'Fight Club', overview: 'A ticking-time-bomb insomniac and soapmaker form underground fight club', release_date: '1999-10-15', vote_average: 8.8, runtime: 139 },
  { tmdb_id: 278, title: 'The Shawshank Redemption', overview: 'Framed in 1940s, Andy Dufresne begins new life at Shawshank prison', release_date: '1994-09-23', vote_average: 9.3, runtime: 142 },
  { tmdb_id: 27205, title: 'Inception', overview: 'Skilled thief infiltrates subconscious to steal corporate secrets', release_date: '2010-07-16', vote_average: 8.8, runtime: 148 },
  { tmdb_id: 238, title: 'The Godfather', overview: 'Chronicle of Italian-American Mafia dynasty 1945-1955', release_date: '1972-03-14', vote_average: 9.2, runtime: 175 },
  { tmdb_id: 240, title: 'The Godfather Part II', overview: 'Continuing saga of Corleone crime family', release_date: '1974-12-12', vote_average: 9.0, runtime: 202 },
  { tmdb_id: 424, title: 'Schindler\'s List', overview: 'Industrialist Oskar Schindler protects workforce during WWII', release_date: '1993-12-15', vote_average: 9.0, runtime: 195 },
  { tmdb_id: 155, title: 'The Dark Knight Rises', overview: 'Batman faces threats eight years after Joker\'s reign', release_date: '2012-07-20', vote_average: 8.5, runtime: 164 },
  { tmdb_id: 496, title: 'The Silence of the Lambs', overview: 'Young FBI cadet seeks help from imprisoned cannibalistic killer', release_date: '1991-02-14', vote_average: 8.6, runtime: 118 },
  { tmdb_id: 11, title: 'Star Wars: A New Hope', overview: 'Luke Skywalker joins Jedi Knight to fight Galactic Empire', release_date: '1977-05-25', vote_average: 8.7, runtime: 121 },
  { tmdb_id: 19995, title: 'Avatar', overview: 'Paraplegic Marine falls in love with Na\'vi princess on Pandora', release_date: '2009-12-18', vote_average: 7.8, runtime: 162 },
  { tmdb_id: 122, title: 'Lord of the Rings: Fellowship', overview: 'Hobbit and companions journey to destroy ring', release_date: '2001-12-19', vote_average: 8.8, runtime: 178 },
  { tmdb_id: 1399, title: 'Breaking Bad', overview: 'High school chemistry teacher turned methamphetamine cook', release_date: '2008-01-20', vote_average: 9.5, runtime: 47 },
  { tmdb_id: 2000, title: 'Game of Thrones', overview: 'Nine families fight for control of Westeros', release_date: '2011-04-17', vote_average: 9.2, runtime: 56 },
  { tmdb_id: 680, title: 'Pulp Fiction', overview: 'Lives of various gangsters intertwine in four tales', release_date: '1994-10-14', vote_average: 8.9, runtime: 154 },
  { tmdb_id: 157336, title: 'Interstellar', overview: 'Explorers travel through wormhole to ensure humanity\'s survival', release_date: '2014-11-07', vote_average: 8.6, runtime: 169 },
  { tmdb_id: 603, title: 'The Matrix', overview: 'Hacker learns true nature of his reality and role in fighting AI', release_date: '1999-03-31', vote_average: 8.7, runtime: 136 },
  { tmdb_id: 13, title: 'Forrest Gump', overview: 'Life of Alabama man through decades of American history', release_date: '1994-07-06', vote_average: 8.8, runtime: 142 },
  { tmdb_id: 1405, title: 'Gladiator', overview: 'Former Roman General seeks vengeance against corrupt emperor', release_date: '2000-05-05', vote_average: 8.5, runtime: 155 },
  { tmdb_id: 278988, title: 'The Green Mile', overview: 'Guards affected by prisoner with miraculous healing powers', release_date: '1999-12-10', vote_average: 8.5, runtime: 189 },
  { tmdb_id: 346, title: 'Se7en', overview: 'Detectives hunt serial killer using seven deadly sins', release_date: '1995-09-22', vote_average: 8.6, runtime: 127 },
  { tmdb_id: 857, title: 'Saving Private Ryan', overview: 'Soldiers go behind enemy lines during D-Day invasion', release_date: '1998-07-24', vote_average: 8.6, runtime: 169 },
  { tmdb_id: 158, title: 'The Usual Suspects', overview: 'Five criminals interrogated about ship robbery', release_date: '1995-08-02', vote_average: 8.5, runtime: 106 },
  { tmdb_id: 496803, title: 'Parasite', overview: 'Class conflict when poor family infiltrates wealthy household', release_date: '2019-05-30', vote_average: 8.6, runtime: 132 },
  { tmdb_id: 105, title: 'Back to the Future', overview: 'Teenager sent 30 years in past must reunite parents', release_date: '1985-11-05', vote_average: 8.5, runtime: 116 },
  { tmdb_id: 22, title: 'Whiplash', overview: 'Drummer battles abusive conductor at music conservatory', release_date: '2014-10-10', vote_average: 8.5, runtime: 107 },
  { tmdb_id: 17925, title: 'The Prestige', overview: 'Magicians battle to create ultimate illusion', release_date: '2006-10-20', vote_average: 8.5, runtime: 130 },
  { tmdb_id: 2971, title: 'The Truman Show', overview: 'Insurance salesman discovers life is reality TV show', release_date: '1998-06-05', vote_average: 8.3, runtime: 103 },
  { tmdb_id: 575, title: 'The Wolf of Wall Street', overview: 'True story of stockbroker Jordan Belfort\'s rise and fall', release_date: '2013-12-25', vote_average: 8.2, runtime: 180 },
  { tmdb_id: 769, title: 'Goodfellas', overview: 'Henry Hill\'s life in the mob through decades', release_date: '1990-09-19', vote_average: 8.7, runtime: 146 },
  { tmdb_id: 289, title: 'Casablanca', overview: 'Romance and intrigue in Casablanca during WWII', release_date: '1942-11-26', vote_average: 8.5, runtime: 102 },
  { tmdb_id: 808, title: 'It\'s a Wonderful Life', overview: 'Angel shows businessman the value of his life and town', release_date: '1946-12-07', vote_average: 8.7, runtime: 130 },
  { tmdb_id: 278995, title: 'Vertigo', overview: 'Detective obsessed with old case spirals into madness', release_date: '1958-05-09', vote_average: 8.3, runtime: 128 },
  { tmdb_id: 15, title: 'Citizen Kane', overview: 'Investigation into final words of publishing tycoon', release_date: '1941-05-01', vote_average: 8.3, runtime: 119 },
  { tmdb_id: 364, title: 'Rear Window', overview: 'Photographer observes murder in neighbor\'s apartment', release_date: '1954-08-01', vote_average: 8.4, runtime: 112 },
  { tmdb_id: 8844, title: 'The Lion King', overview: 'Prince Simba flees after father\'s death and returns', release_date: '1994-06-19', vote_average: 8.3, runtime: 88 },
  { tmdb_id: 16869, title: 'Aladdin', overview: 'Street urchin finds magic lamp and wishes for better life', release_date: '1992-11-13', vote_average: 8.0, runtime: 90 },
  { tmdb_id: 862, title: 'Toy Story', overview: 'Cowboy doll and space ranger compete for owner\'s love', release_date: '1995-11-22', vote_average: 8.3, runtime: 81 },
  { tmdb_id: 399566, title: 'Coco', overview: 'Young musician enters Land of Dead to find answers', release_date: '2017-11-22', vote_average: 8.4, runtime: 105 },
  { tmdb_id: 109445, title: 'Frozen', overview: 'Queen Elsa\'s magic powers create eternal winter', release_date: '2013-11-27', vote_average: 7.6, runtime: 102 },
  { tmdb_id: 420818, title: 'Moana', overview: 'Islander voyage to save people with demigod Maui', release_date: '2016-11-23', vote_average: 7.7, runtime: 107 },
  { tmdb_id: 24428, title: 'The Avengers', overview: 'Earth\'s heroes assemble against alien invasion', release_date: '2012-05-04', vote_average: 8.0, runtime: 143 },
  { tmdb_id: 299534, title: 'Avengers: Endgame', overview: 'Avengers fight to reverse Thanos\' snap', release_date: '2019-04-26', vote_average: 8.4, runtime: 181 },
  { tmdb_id: 284054, title: 'Black Panther', overview: 'T\'Challa returns to Wakanda after father\'s death', release_date: '2018-02-16', vote_average: 7.3, runtime: 134 },
  { tmdb_id: 559969, title: 'Thor: Love and Thunder', overview: 'Thor searches for purpose and battles new threats', release_date: '2022-07-06', vote_average: 6.7, runtime: 119 },
  { tmdb_id: 349488, title: 'Doctor Strange', overview: 'Sorcerer protects Earth from interdimensional threats', release_date: '2016-11-04', vote_average: 7.5, runtime: 115 },
  { tmdb_id: 1726, title: 'Iron Man', overview: 'Billionaire Tony Stark builds armor suit to fight terrorism', release_date: '2008-05-02', vote_average: 7.9, runtime: 126 },
  { tmdb_id: 100402, title: 'Captain America: First Avenger', overview: 'Super soldier Steve Rogers fights Nazis during WWII', release_date: '2011-07-22', vote_average: 6.9, runtime: 124 },
  { tmdb_id: 557, title: 'Spider-Man', overview: 'Teenager Peter Parker gains spider powers after bite', release_date: '2002-05-03', vote_average: 7.3, runtime: 121 },
];

const platformMappings = [
  // Netflix (platform_id = 1) - 15 películas
  { movie_id: 1, platform_id: 1 },
  { movie_id: 2, platform_id: 1 },
  { movie_id: 3, platform_id: 1 },
  { movie_id: 6, platform_id: 1 },
  { movie_id: 8, platform_id: 1 },
  { movie_id: 12, platform_id: 1 },
  { movie_id: 22, platform_id: 1 },
  { movie_id: 24, platform_id: 1 },
  { movie_id: 27, platform_id: 1 },
  { movie_id: 28, platform_id: 1 },
  { movie_id: 30, platform_id: 1 },
  { movie_id: 34, platform_id: 1 },
  { movie_id: 36, platform_id: 1 },
  { movie_id: 38, platform_id: 1 },
  { movie_id: 39, platform_id: 1 },
  
  // HBO Max (platform_id = 4) - 15 películas
  { movie_id: 4, platform_id: 4 },
  { movie_id: 5, platform_id: 4 },
  { movie_id: 6, platform_id: 4 },
  { movie_id: 7, platform_id: 4 },
  { movie_id: 13, platform_id: 4 },
  { movie_id: 19, platform_id: 4 },
  { movie_id: 21, platform_id: 4 },
  { movie_id: 23, platform_id: 4 },
  { movie_id: 25, platform_id: 4 },
  { movie_id: 26, platform_id: 4 },
  { movie_id: 29, platform_id: 4 },
  { movie_id: 31, platform_id: 4 },
  { movie_id: 32, platform_id: 4 },
  { movie_id: 35, platform_id: 4 },
  { movie_id: 37, platform_id: 4 },
  
  // Prime Video (platform_id = 2) - 15 películas
  { movie_id: 1, platform_id: 2 },
  { movie_id: 7, platform_id: 2 },
  { movie_id: 9, platform_id: 2 },
  { movie_id: 10, platform_id: 2 },
  { movie_id: 12, platform_id: 2 },
  { movie_id: 15, platform_id: 2 },
  { movie_id: 16, platform_id: 2 },
  { movie_id: 17, platform_id: 2 },
  { movie_id: 20, platform_id: 2 },
  { movie_id: 42, platform_id: 2 },
  { movie_id: 43, platform_id: 2 },
  { movie_id: 44, platform_id: 2 },
  { movie_id: 45, platform_id: 2 },
  { movie_id: 46, platform_id: 2 },
  { movie_id: 47, platform_id: 2 },
  
  // Disney+ (platform_id = 3) - 14 películas
  { movie_id: 34, platform_id: 3 },
  { movie_id: 35, platform_id: 3 },
  { movie_id: 36, platform_id: 3 },
  { movie_id: 37, platform_id: 3 },
  { movie_id: 38, platform_id: 3 },
  { movie_id: 39, platform_id: 3 },
  { movie_id: 40, platform_id: 3 },
  { movie_id: 41, platform_id: 3 },
  { movie_id: 42, platform_id: 3 },
  { movie_id: 43, platform_id: 3 },
  { movie_id: 44, platform_id: 3 },
  { movie_id: 45, platform_id: 3 },
  { movie_id: 46, platform_id: 3 },
  { movie_id: 47, platform_id: 3 },
];

async function populateDatabase() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'popflix'
  });

  try {
    console.log('🗑️  Limpiando tablas...');
    await connection.query('DELETE FROM movies_platforms');
    await connection.query('DELETE FROM movies');

    console.log('📝 Insertando películas...');
    for (const movie of movies) {
      await connection.query(
        'INSERT INTO movies (tmdb_id, title, description, release_date, rating, runtime) VALUES (?, ?, ?, ?, ?, ?)',
        [movie.tmdb_id, movie.title, movie.overview, movie.release_date, movie.vote_average, movie.runtime]
      );
    }
    console.log(`✅ Insertadas ${movies.length} películas`);

    console.log('🎬 Asignando películas a plataformas...');
    for (const mapping of platformMappings) {
      await connection.query(
        'INSERT IGNORE INTO movies_platforms (movie_id, platform_id) VALUES (?, ?)',
        [mapping.movie_id, mapping.platform_id]
      );
    }
    console.log(`✅ Asignadas ${platformMappings.length} películas a plataformas`);

    // Verificar
    const [moviesCount] = await connection.query('SELECT COUNT(*) as count FROM movies');
    const [platformCount] = await connection.query('SELECT COUNT(*) as count FROM movies_platforms');
    console.log(`\n📊 Estado final:`);
    console.log(`   ✅ Total películas: ${moviesCount[0].count}`);
    console.log(`   ✅ Total asignaciones: ${platformCount[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await connection.end();
  }
}

populateDatabase();
