const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "popflix",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Géneros estándar de TMDB
const genres = [
  { tmdb_id: 28, name: "Action" },
  { tmdb_id: 12, name: "Adventure" },
  { tmdb_id: 16, name: "Animation" },
  { tmdb_id: 35, name: "Comedy" },
  { tmdb_id: 80, name: "Crime" },
  { tmdb_id: 99, name: "Documentary" },
  { tmdb_id: 18, name: "Drama" },
  { tmdb_id: 10751, name: "Family" },
  { tmdb_id: 14, name: "Fantasy" },
  { tmdb_id: 36, name: "History" },
  { tmdb_id: 27, name: "Horror" },
  { tmdb_id: 10402, name: "Music" },
  { tmdb_id: 9648, name: "Mystery" },
  { tmdb_id: 10749, name: "Romance" },
  { tmdb_id: 878, name: "Science Fiction" },
  { tmdb_id: 10770, name: "TV Movie" },
  { tmdb_id: 53, name: "Thriller" },
  { tmdb_id: 10752, name: "War" },
  { tmdb_id: 37, name: "Western" },
  { tmdb_id: 10765, name: "Sci-Fi & Fantasy" },
];

async function insertGenres() {
  const connection = await pool.getConnection();

  try {
    console.log("🔄 Insertando géneros estándar...");

    for (const genre of genres) {
      try {
        await connection.query(
          "INSERT IGNORE INTO genres (tmdb_id, name) VALUES (?, ?)",
          [genre.tmdb_id, genre.name]
        );
        console.log(`✅ Género: ${genre.name}`);
      } catch (e) {
        console.warn(`⚠️  Error insertando ${genre.name}:`, e.message);
      }
    }

    console.log("✅ Géneros insertados correctamente");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

insertGenres();
