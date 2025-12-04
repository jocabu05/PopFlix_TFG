-- Tabla para mapear películas con plataformas
CREATE TABLE IF NOT EXISTS movies_platforms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  platform_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_movie_platform (movie_id, platform_id)
);

-- Insertar películas populares con sus plataformas
-- Netflix movies
INSERT IGNORE INTO movies_platforms (movie_id, platform_id) 
SELECT DISTINCT m.id, 1 FROM movies m 
WHERE m.title IN ('Zootrópolis 2', 'TRON: Ares', 'Trol 2', 'Bugonia', 'The Brutalist')
LIMIT 5;

-- Prime Video movies
INSERT IGNORE INTO movies_platforms (movie_id, platform_id) 
SELECT DISTINCT m.id, 3 FROM movies m 
WHERE m.title IN ('The Brutalist', 'Nosferatu', 'A Different Man', 'Incoming')
LIMIT 5;

-- Disney+ movies
INSERT IGNORE INTO movies_platforms (movie_id, platform_id) 
SELECT DISTINCT m.id, 4 FROM movies m 
WHERE m.title IN ('Zootrópolis 2', 'Mufasa: The Lion King', 'Inside Out 2')
LIMIT 5;

-- HBO movies
INSERT IGNORE INTO movies_platforms (movie_id, platform_id) 
SELECT DISTINCT m.id, 2 FROM movies m 
WHERE m.title IN ('Nosferatu', 'Wicked', 'Dune: Part Two')
LIMIT 5;
