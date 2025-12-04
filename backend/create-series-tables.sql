-- Tabla de series
CREATE TABLE IF NOT EXISTS series (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tmdb_id INT UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description LONGTEXT,
  poster_url VARCHAR(500),
  backdrop_url VARCHAR(500),
  first_air_date DATE,
  last_air_date DATE,
  rating DECIMAL(3, 1),
  popularity DECIMAL(8, 2),
  number_of_seasons INT,
  number_of_episodes INT,
  status VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Relación entre series y géneros
CREATE TABLE IF NOT EXISTS series_genres (
  id INT AUTO_INCREMENT PRIMARY KEY,
  series_id INT NOT NULL,
  genre_id INT NOT NULL,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
  FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE,
  UNIQUE KEY unique_series_genre (series_id, genre_id)
);

-- Disponibilidad de series en plataformas
CREATE TABLE IF NOT EXISTS series_platforms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  series_id INT NOT NULL,
  platform_id INT NOT NULL,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_series_platform (series_id, platform_id)
);

-- Calificaciones de usuario para series
CREATE TABLE IF NOT EXISTS user_series_ratings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  series_id INT NOT NULL,
  rating DECIMAL(2, 1),
  watched BOOLEAN DEFAULT FALSE,
  watched_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_series (user_id, series_id)
);

-- Favoritos de usuario para series
CREATE TABLE IF NOT EXISTS user_series_favorites (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  series_id INT NOT NULL,
  added_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_series_favorite (user_id, series_id),
  INDEX idx_user_series_favorites (user_id)
);

-- Historial de visualización para series
CREATE TABLE IF NOT EXISTS user_series_watch_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  series_id INT NOT NULL,
  episode_number INT,
  watched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_watched INT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
  INDEX idx_user_series_history (user_id),
  INDEX idx_series_watch_date (watched_at DESC)
);

-- Reseñas de usuarios para series
CREATE TABLE IF NOT EXISTS user_series_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  series_id INT NOT NULL,
  rating DECIMAL(2, 1) NOT NULL,
  review_text LONGTEXT,
  helpful_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (series_id) REFERENCES series(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_series_review (user_id, series_id),
  INDEX idx_series_reviews (series_id)
);
