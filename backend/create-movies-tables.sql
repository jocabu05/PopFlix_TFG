-- Tabla de películas
CREATE TABLE IF NOT EXISTS movies (
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
);

-- Tabla de géneros
CREATE TABLE IF NOT EXISTS genres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tmdb_id INT UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL
);

-- Relación entre películas y géneros
CREATE TABLE IF NOT EXISTS movie_genres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  genre_id INT NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE,
  UNIQUE KEY unique_movie_genre (movie_id, genre_id)
);

-- Disponibilidad de películas en plataformas
CREATE TABLE IF NOT EXISTS movie_platforms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  movie_id INT NOT NULL,
  platform_id INT NOT NULL,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_movie_platform (movie_id, platform_id)
);

-- Calificaciones de usuario
CREATE TABLE IF NOT EXISTS user_movie_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  rating DECIMAL(2, 1),
  watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_movie (user_id, movie_id)
);

-- Ranking semanal
CREATE TABLE IF NOT EXISTS weekly_ranking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  week_start DATE NOT NULL,
  movie_id INT NOT NULL,
  position INT NOT NULL,
  score DECIMAL(8, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_week_position (week_start, position)
);

-- Favoritos del usuario (Mi Lista)
CREATE TABLE IF NOT EXISTS user_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_favorite (user_id, movie_id),
  INDEX idx_user_favorites (user_id)
);

-- Historial de visualización
CREATE TABLE IF NOT EXISTS user_watch_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_watched INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  INDEX idx_user_history (user_id),
  INDEX idx_watch_date (watched_at DESC)
);

-- Reseñas de usuarios
CREATE TABLE IF NOT EXISTS user_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  movie_id INT NOT NULL,
  rating DECIMAL(2, 1) NOT NULL,
  content LONGTEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_movie_review (user_id, movie_id),
  INDEX idx_movie_reviews (movie_id),
  INDEX idx_user_reviews (user_id),
  INDEX idx_review_date (created_at DESC)
);

-- Índices para mejores queries
CREATE INDEX idx_movie_popularity ON movies(popularity DESC);
CREATE INDEX idx_movie_rating ON movies(rating DESC);
CREATE INDEX idx_movie_release_date ON movies(release_date DESC);
CREATE INDEX idx_movie_genres ON movie_genres(genre_id);
CREATE INDEX idx_user_ratings ON user_movie_ratings(user_id);
CREATE INDEX idx_weekly_ranking_week ON weekly_ranking(week_start DESC);
