-- Crear tabla movies_platforms desde cero
DROP TABLE IF EXISTS movies_platforms;

CREATE TABLE movies_platforms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  movie_id INT NOT NULL,
  platform_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (movie_id) REFERENCES movies(id) ON DELETE CASCADE,
  FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE,
  UNIQUE KEY unique_movie_platform (movie_id, platform_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Asignar películas a plataformas basado en IDs
-- Netflix (platform_id = 1) - primeras 15 películas
INSERT INTO movies_platforms (movie_id, platform_id)
SELECT id, 1 FROM movies ORDER BY id LIMIT 15;

-- HBO (platform_id = 2) - películas 16-30
INSERT INTO movies_platforms (movie_id, platform_id)
SELECT id, 2 FROM movies ORDER BY id LIMIT 15 OFFSET 15;

-- Prime Video (platform_id = 3) - películas 31-45
INSERT INTO movies_platforms (movie_id, platform_id)
SELECT id, 3 FROM movies ORDER BY id LIMIT 15 OFFSET 30;

-- Disney+ (platform_id = 4) - películas 46-60
INSERT INTO movies_platforms (movie_id, platform_id)
SELECT id, 4 FROM movies ORDER BY id LIMIT 15 OFFSET 45;

-- Agregar películas a múltiples plataformas (overlapping)
INSERT IGNORE INTO movies_platforms (movie_id, platform_id)
SELECT id, 1 FROM movies ORDER BY id LIMIT 10 OFFSET 60;

INSERT IGNORE INTO movies_platforms (movie_id, platform_id)
SELECT id, 3 FROM movies ORDER BY id LIMIT 10 OFFSET 70;

INSERT IGNORE INTO movies_platforms (movie_id, platform_id)
SELECT id, 2 FROM movies ORDER BY id LIMIT 10 OFFSET 80;

INSERT IGNORE INTO movies_platforms (movie_id, platform_id)
SELECT id, 4 FROM movies ORDER BY id LIMIT 10 OFFSET 90;
