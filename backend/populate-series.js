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

// Series populares reales
const series = [
  {
    tmdb_id: 1399,
    title: "Breaking Bad",
    description: "A high school chemistry teacher turned methamphetamine producer partners with a former student.",
    poster_url: "https://image.tmdb.org/t/p/w342/ggFHVNu6YYI5Ludwig/nfNZo_zjgzrG7MD9VAcF7g7l2x0.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/tsRy63Hu5ya8090UJFuIWSOeNYV.jpg",
    first_air_date: "2008-01-20",
    last_air_date: "2013-09-29",
    rating: 9.5,
    popularity: 450.5,
    number_of_seasons: 5,
    number_of_episodes: 62,
    status: "Ended",
    genres: [18, 80] // Drama, Crime
  },
  {
    tmdb_id: 1396,
    title: "Game of Thrones",
    description: "Nine noble families fight for control over the mythical land of Westeros.",
    poster_url: "https://image.tmdb.org/t/p/w342/1XS1oqL23opJnmZo7e2v2FljCf.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/lfgN1L5p0JSyF6ite7LEjNbSNDB.jpg",
    first_air_date: "2011-04-17",
    last_air_date: "2019-05-19",
    rating: 9.3,
    popularity: 420.8,
    number_of_seasons: 8,
    number_of_episodes: 73,
    status: "Ended",
    genres: [14, 18] // Fantasy, Drama
  },
  {
    tmdb_id: 1668,
    title: "Friends",
    description: "Six friends navigate life and love in New York City.",
    poster_url: "https://image.tmdb.org/t/p/w342/f496cm9ePDAvfWfwxv91ScHQcY5.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/fW1WrnDcVhm1czYeP4I2qr8PvXr.jpg",
    first_air_date: "1994-09-22",
    last_air_date: "2004-05-06",
    rating: 8.9,
    popularity: 380.2,
    number_of_seasons: 10,
    number_of_episodes: 236,
    status: "Ended",
    genres: [35] // Comedy
  },
  {
    tmdb_id: 60573,
    title: "Peaky Blinders",
    description: "A gangster family epic set in 1920s Birmingham.",
    poster_url: "https://image.tmdb.org/t/p/w342/sz87d0O9ec8qemWY19fzVy4X5Em.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/vUhwrYeY0nnEFQspCTVTt32xrgo.jpg",
    first_air_date: "2013-09-12",
    last_air_date: "2022-04-03",
    rating: 8.8,
    popularity: 360.5,
    number_of_seasons: 6,
    number_of_episodes: 36,
    status: "Ended",
    genres: [18, 80] // Drama, Crime
  },
  {
    tmdb_id: 1402,
    title: "The Office",
    description: "A mockumentary follow the everyday lives of office employees.",
    poster_url: "https://image.tmdb.org/t/p/w342/3Z7ST55fowAXe5ie5SEXwLoQQXU.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/5I8NI1h7IfAPWBgQqb0B7YsKc7H.jpg",
    first_air_date: "2005-03-24",
    last_air_date: "2013-05-16",
    rating: 9.0,
    popularity: 340.3,
    number_of_seasons: 9,
    number_of_episodes: 201,
    status: "Ended",
    genres: [35] // Comedy
  },
  {
    tmdb_id: 1631,
    title: "Sherlock",
    description: "A modern-day take on Sherlock Holmes solving crimes in London.",
    poster_url: "https://image.tmdb.org/t/p/w342/y7PfYQ4Hpx1p60S5dHvVdHJzwQP.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/1Fm0sLXYC6sH5z0kbGHhGw1vb2L.jpg",
    first_air_date: "2010-07-25",
    last_air_date: "2017-01-15",
    rating: 9.1,
    popularity: 325.7,
    number_of_seasons: 4,
    number_of_episodes: 13,
    status: "Ended",
    genres: [18, 9648] // Drama, Mystery
  },
  {
    tmdb_id: 1409,
    title: "The Crown",
    description: "A dramatization of the reign of Queen Elizabeth II.",
    poster_url: "https://image.tmdb.org/t/p/w342/iQFcwSGbZXMkeyKrxbPnwnRo5fl.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/qsLj5CxaB6hfZJH5HkLPcNe6WkL.jpg",
    first_air_date: "2016-11-04",
    last_air_date: "2023-12-06",
    rating: 8.6,
    popularity: 310.2,
    number_of_seasons: 6,
    number_of_episodes: 50,
    status: "Ended",
    genres: [18] // Drama
  },
  {
    tmdb_id: 48891,
    title: "The Mandalorian",
    description: "A lone bounty hunter operates in the outer reaches of the galaxy.",
    poster_url: "https://image.tmdb.org/t/p/w342/eU1i6eHXlzMOlEq0ku1Rzq7b8tY.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/aJn9XeesqfsyrBQnk1jQWzG7Xmj.jpg",
    first_air_date: "2019-11-12",
    last_air_date: null,
    rating: 8.7,
    popularity: 330.4,
    number_of_seasons: 3,
    number_of_episodes: 24,
    status: "Returning",
    genres: [14, 28] // Fantasy, Action
  },
  {
    tmdb_id: 456,
    title: "The Office (UK)",
    description: "A mockumentary of office life in a small British company.",
    poster_url: "https://image.tmdb.org/t/p/w342/5K0RcL6Gg4xVKHSxPkd1DuKMv0t.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/S0Qj5QdP6VqLGHlRJdMJ3zFdOvj.jpg",
    first_air_date: "2001-07-09",
    last_air_date: "2003-07-29",
    rating: 8.5,
    popularity: 295.8,
    number_of_seasons: 2,
    number_of_episodes: 12,
    status: "Ended",
    genres: [35] // Comedy
  },
  {
    tmdb_id: 1671,
    title: "Doctor Who",
    description: "A time traveler and alien explore the universe in a time machine.",
    poster_url: "https://image.tmdb.org/t/p/w342/8XCFIGbJKFtdAgxrTFy7ZSHL6B4.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/xK9.YiCCGJu5aLg8yGlhIawpHUb.jpg",
    first_air_date: "1963-11-23",
    last_air_date: null,
    rating: 8.3,
    popularity: 285.3,
    number_of_seasons: 13,
    number_of_episodes: 174,
    status: "Returning",
    genres: [14, 18] // Fantasy, Drama
  },
  {
    tmdb_id: 1433,
    title: "The Stranger",
    description: "A mysterious woman arrives in a small town and disrupts the life of a police chief.",
    poster_url: "https://image.tmdb.org/t/p/w342/7gfJ0H5qknq7DMp6fj1NmqpD75a.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/bIrT28AHnwUczgF9LjCUAA8OBKM.jpg",
    first_air_date: "2020-01-30",
    last_air_date: "2020-02-06",
    rating: 7.8,
    popularity: 270.5,
    number_of_seasons: 1,
    number_of_episodes: 8,
    status: "Ended",
    genres: [18, 9648] // Drama, Mystery
  },
  {
    tmdb_id: 2543,
    title: "Westworld",
    description: "A robotic theme park brings artificial beings to life.",
    poster_url: "https://image.tmdb.org/t/p/w342/gEKwVN3Y7bQ9LPHdVFP8qFyRfEb.jpg",
    backdrop_url: "https://image.tmdb.org/t/p/w1280/zPR2XcQIVAiVCxHEDnPqMW1kOXN.jpg",
    first_air_date: "2016-10-02",
    last_air_date: "2022-06-27",
    rating: 8.5,
    popularity: 280.8,
    number_of_seasons: 4,
    number_of_episodes: 36,
    status: "Ended",
    genres: [14, 878] // Fantasy, Science Fiction
  }
];

async function populateSeries() {
  const connection = await pool.getConnection();

  try {
    console.log("🔄 Iniciando inserción de series...");
    
    // Primero, limpiar series existentes para repoblar
    await connection.query("DELETE FROM series_genres");
    await connection.query("DELETE FROM series_platforms");
    await connection.query("DELETE FROM series");

    for (const s of series) {
      // Insertar serie
      await connection.query(
        `INSERT INTO series (tmdb_id, title, description, poster_url, backdrop_url, first_air_date, last_air_date, rating, popularity, number_of_seasons, number_of_episodes, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [s.tmdb_id, s.title, s.description, s.poster_url, s.backdrop_url, s.first_air_date, s.last_air_date, s.rating, s.popularity, s.number_of_seasons, s.number_of_episodes, s.status]
      );

      // Obtener ID de la serie
      const [seriesRows] = await connection.query("SELECT id FROM series WHERE tmdb_id = ?", [s.tmdb_id]);
      const seriesId = seriesRows[0].id;

      // Insertar géneros
      for (const genreId of s.genres) {
        try {
          await connection.query("INSERT INTO series_genres (series_id, genre_id) VALUES (?, ?)", [seriesId, genreId]);
        } catch (e) {
          console.warn(`⚠️  Genre ${genreId} might not exist for series ${s.title}`);
        }
      }

      // Asignar a plataformas (aleatoriamente)
      const platformIds = [1, 2, 3, 4, 5];
      const shuffled = platformIds.sort(() => Math.random() - 0.5).slice(0, Math.ceil(Math.random() * 3) + 1);
      for (const platformId of shuffled) {
        try {
          await connection.query("INSERT INTO series_platforms (series_id, platform_id) VALUES (?, ?)", [seriesId, platformId]);
        } catch (e) {
          console.warn(`⚠️  Platform ${platformId} might not exist`);
        }
      }

      console.log(`✅ Serie insertada: ${s.title}`);
    }

    console.log("✅ Series pobladas exitosamente");
  } catch (error) {
    console.error("❌ Error poblando series:", error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

populateSeries();
