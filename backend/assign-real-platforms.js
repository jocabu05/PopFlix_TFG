const mysql = require("mysql2/promise");

// Configuración de la base de datos
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "1234",
  database: "popflix",
};

// Plataformas con sus IDs (según la tabla platforms)
const PLATFORMS = {
  NETFLIX: 1,
  PRIME_VIDEO: 2,
  DISNEY_PLUS: 3,
  HBO_MAX: 4,
  HULU: 5,
  PARAMOUNT_PLUS: 6,
  APPLE_TV: 7,
};

// Reglas de asignación REALES basadas en estudios/franquicias
const PLATFORM_RULES = {
  // Disney+ - Disney, Marvel, Star Wars, Pixar, National Geographic
  DISNEY_PLUS: {
    titlePatterns: [
      // Marvel
      "Avengers", "Iron Man", "Thor", "Captain America", "Spider-Man", "Black Panther",
      "Ant-Man", "Doctor Strange", "Guardians of the Galaxy", "Black Widow", "Shang-Chi",
      "Eternals", "Marvels", "Hulk", "Hawkeye", "Loki", "WandaVision",
      // Star Wars
      "Star Wars", "Mandalorian", "Boba Fett", "Obi-Wan", "Ahsoka", "Andor",
      // Disney Animation
      "Frozen", "Moana", "Encanto", "Coco", "Zootopia", "Big Hero", "Tangled",
      "Lion King", "Aladdin", "Little Mermaid", "Beauty and the Beast", "Mulan",
      "Pocahontas", "Hercules", "Tarzan", "Lilo", "Bambi", "Dumbo", "Pinocchio",
      // Pixar
      "Toy Story", "Finding Nemo", "Finding Dory", "Monsters", "Incredibles",
      "Cars", "Wall-E", "Up", "Inside Out", "Soul", "Luca", "Turning Red",
      "Lightyear", "Elemental", "Ratatouille", "Brave",
      // Other Disney
      "Pirates of the Caribbean", "Indiana Jones", "Avatar", "Jungle Book",
      "Mary Poppins", "Pete's Dragon", "Cinderella", "Sleeping Beauty",
    ],
    genreBoost: ["Animation", "Family", "Adventure"],
  },

  // Netflix - Originales de Netflix
  NETFLIX: {
    titlePatterns: [
      "Stranger Things", "Wednesday", "Squid Game", "The Crown", "Bridgerton",
      "Ozark", "Money Heist", "Dark", "Narcos", "You", "Elite", "Lupin",
      "The Witcher", "Cobra Kai", "Emily in Paris", "Never Have I Ever",
      "Extraction", "Red Notice", "Glass Onion", "Knives Out", "The Adam Project",
      "Don't Look Up", "Army of the Dead", "Bird Box", "The Old Guard",
      "Enola Holmes", "The Gray Man", "Triple Frontier", "6 Underground",
    ],
    genreBoost: ["Thriller", "Crime", "Drama"],
  },

  // HBO Max - Warner Bros, DC Comics, HBO Originals
  HBO_MAX: {
    titlePatterns: [
      // DC Comics
      "Batman", "Superman", "Wonder Woman", "Justice League", "Aquaman",
      "Flash", "Shazam", "Suicide Squad", "Harley Quinn", "Birds of Prey",
      "Black Adam", "Blue Beetle", "Joker", "Catwoman", "Green Lantern",
      // Warner Bros
      "Harry Potter", "Fantastic Beasts", "Matrix", "Dune", "Lord of the Rings",
      "Hobbit", "Godzilla", "Kong", "Mad Max", "Blade Runner", "Tenet",
      "Interstellar", "Inception", "Dunkirk", "Oppenheimer",
      // HBO
      "Game of Thrones", "House of the Dragon", "Euphoria", "Succession",
      "The Last of Us", "White Lotus", "True Detective", "Westworld",
    ],
    genreBoost: ["Action", "Science Fiction", "Fantasy"],
  },

  // Prime Video - Amazon Studios
  PRIME_VIDEO: {
    titlePatterns: [
      "Rings of Power", "The Boys", "Jack Ryan", "Reacher", "The Marvelous",
      "Fleabag", "Good Omens", "Citadel", "Fallout", "Invincible",
      "The Terminal List", "Tomorrow War", "Coming 2 America", "Borat",
      "Without Remorse", "The Report", "Sound of Metal",
    ],
    genreBoost: ["Comedy", "Documentary"],
  },

  // Paramount+ - Paramount Pictures, Nickelodeon
  PARAMOUNT_PLUS: {
    titlePatterns: [
      "Mission Impossible", "Top Gun", "Transformers", "Star Trek",
      "Sonic", "Teenage Mutant Ninja", "Terminator", "Titanic",
      "SpongeBob", "Yellowstone", "Scream", "Quiet Place", "Clifford",
      "PAW Patrol", "Grease", "Godfather", "Forrest Gump",
    ],
    genreBoost: [],
  },

  // Apple TV+ - Apple Originals
  APPLE_TV: {
    titlePatterns: [
      "Ted Lasso", "Severance", "Foundation", "Morning Show", "See",
      "For All Mankind", "Pachinko", "Slow Horses", "Shrinking",
      "Killers of the Flower Moon", "Napoleon", "CODA", "Finch",
    ],
    genreBoost: [],
  },
};

async function assignRealPlatforms() {
  const connection = await mysql.createConnection(dbConfig);

  try {
    console.log("🎬 Iniciando asignación REAL de plataformas...\n");

    // Limpiar asignaciones anteriores
    await connection.execute("DELETE FROM movie_platforms");
    await connection.execute("DELETE FROM series_platforms");
    console.log("🗑️  Limpiadas asignaciones anteriores\n");

    // Obtener todas las películas con su género principal
    const [movies] = await connection.execute(`
      SELECT m.id, m.title, 
        (SELECT g.name FROM movie_genres mg 
         JOIN genres g ON mg.genre_id = g.id 
         WHERE mg.movie_id = m.id LIMIT 1) as genre
      FROM movies m
    `);

    // Obtener todas las series con su género principal
    const [series] = await connection.execute(`
      SELECT s.id, s.title,
        (SELECT g.name FROM series_genres sg 
         JOIN genres g ON sg.genre_id = g.id 
         WHERE sg.series_id = s.id LIMIT 1) as genre
      FROM series s
    `);

    let movieAssignments = 0;
    let seriesAssignments = 0;

    // Asignar plataformas a películas
    for (const movie of movies) {
      const platforms = determinePlatforms(movie.title, movie.genre);
      
      for (const platformId of platforms) {
        await connection.execute(
          "INSERT INTO movie_platforms (movie_id, platform_id) VALUES (?, ?)",
          [movie.id, platformId]
        );
        movieAssignments++;
      }
    }

    // Asignar plataformas a series
    for (const serie of series) {
      const platforms = determinePlatforms(serie.title, serie.genre);
      
      for (const platformId of platforms) {
        await connection.execute(
          "INSERT INTO series_platforms (series_id, platform_id) VALUES (?, ?)",
          [serie.id, platformId]
        );
        seriesAssignments++;
      }
    }

    console.log(`✅ Películas: ${movieAssignments} asignaciones`);
    console.log(`✅ Series: ${seriesAssignments} asignaciones`);

    // Mostrar distribución
    const [movieDist] = await connection.execute(`
      SELECT p.name, COUNT(*) as total 
      FROM platforms p 
      JOIN movie_platforms mp ON p.id = mp.platform_id 
      GROUP BY p.name 
      ORDER BY total DESC
    `);

    const [seriesDist] = await connection.execute(`
      SELECT p.name, COUNT(*) as total 
      FROM platforms p 
      JOIN series_platforms sp ON p.id = sp.platform_id 
      GROUP BY p.name 
      ORDER BY total DESC
    `);

    console.log("\n📊 Distribución de películas por plataforma:");
    movieDist.forEach((row) => console.log(`   ${row.name}: ${row.total}`));

    console.log("\n📺 Distribución de series por plataforma:");
    seriesDist.forEach((row) => console.log(`   ${row.name}: ${row.total}`));

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await connection.end();
  }
}

function determinePlatforms(title, genre) {
  const platforms = new Set();
  const titleLower = title.toLowerCase();

  // 1. Buscar coincidencias por título (más importante)
  for (const [platformKey, rules] of Object.entries(PLATFORM_RULES)) {
    for (const pattern of rules.titlePatterns) {
      if (titleLower.includes(pattern.toLowerCase())) {
        platforms.add(PLATFORMS[platformKey]);
        break;
      }
    }
  }

  // 2. Si no hay coincidencia por título, asignar según género con probabilidad
  if (platforms.size === 0) {
    // Distribución base realista
    const random = Math.random();
    
    if (genre === "Animation" || genre === "Family") {
      // Animación va más a Disney+
      if (random < 0.6) platforms.add(PLATFORMS.DISNEY_PLUS);
      else if (random < 0.8) platforms.add(PLATFORMS.NETFLIX);
      else platforms.add(PLATFORMS.PRIME_VIDEO);
    } else if (genre === "Action" || genre === "Science Fiction") {
      // Acción/SciFi - distribuir entre HBO y Netflix principalmente
      if (random < 0.35) platforms.add(PLATFORMS.HBO_MAX);
      else if (random < 0.65) platforms.add(PLATFORMS.NETFLIX);
      else if (random < 0.85) platforms.add(PLATFORMS.PRIME_VIDEO);
      else platforms.add(PLATFORMS.DISNEY_PLUS);
    } else if (genre === "Horror" || genre === "Thriller") {
      // Terror - Netflix, Prime, Paramount
      if (random < 0.4) platforms.add(PLATFORMS.NETFLIX);
      else if (random < 0.7) platforms.add(PLATFORMS.PRIME_VIDEO);
      else platforms.add(PLATFORMS.PARAMOUNT_PLUS);
    } else if (genre === "Comedy") {
      // Comedia - Netflix, Prime, Paramount
      if (random < 0.4) platforms.add(PLATFORMS.NETFLIX);
      else if (random < 0.7) platforms.add(PLATFORMS.PRIME_VIDEO);
      else platforms.add(PLATFORMS.HBO_MAX);
    } else if (genre === "Documentary") {
      // Documentales - Netflix, Prime, Apple
      if (random < 0.5) platforms.add(PLATFORMS.NETFLIX);
      else if (random < 0.8) platforms.add(PLATFORMS.PRIME_VIDEO);
      else platforms.add(PLATFORMS.APPLE_TV);
    } else {
      // Drama y otros - distribución general
      if (random < 0.3) platforms.add(PLATFORMS.NETFLIX);
      else if (random < 0.5) platforms.add(PLATFORMS.HBO_MAX);
      else if (random < 0.7) platforms.add(PLATFORMS.PRIME_VIDEO);
      else if (random < 0.85) platforms.add(PLATFORMS.DISNEY_PLUS);
      else platforms.add(PLATFORMS.PARAMOUNT_PLUS);
    }
  }

  // 3. Algunas películas populares pueden estar en múltiples plataformas (20% chance)
  if (platforms.size === 1 && Math.random() < 0.2) {
    const available = Object.values(PLATFORMS).filter(p => !platforms.has(p));
    if (available.length > 0) {
      platforms.add(available[Math.floor(Math.random() * available.length)]);
    }
  }

  return Array.from(platforms);
}

assignRealPlatforms();
