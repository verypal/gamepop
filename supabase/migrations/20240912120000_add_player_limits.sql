ALTER TABLE sessions
  ADD COLUMN min_players INT NOT NULL DEFAULT 1,
  ADD COLUMN max_players INT NOT NULL DEFAULT 1,
  ADD CONSTRAINT sessions_min_players_check CHECK (min_players >= 1),
  ADD CONSTRAINT sessions_max_players_ge_min CHECK (max_players >= min_players),
  ADD CONSTRAINT sessions_max_players_le_100 CHECK (max_players <= 100);
