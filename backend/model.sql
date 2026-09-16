-- model.sql
-- Schema and seed data for the Music Library database.
-- This file is executed once by db.js the first time data/app.db is created.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS artists (
  artist_id         INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_name       TEXT NOT NULL,
  genre             TEXT,
  monthly_listeners INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS albums (
  album_id          INTEGER PRIMARY KEY AUTOINCREMENT,
  album_name        TEXT NOT NULL,
  release_year      INTEGER,
  number_of_listens INTEGER DEFAULT 0,
  artist_id         INTEGER NOT NULL,
  FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS songs (
  song_id      INTEGER PRIMARY KEY AUTOINCREMENT,
  song_name    TEXT NOT NULL,
  release_year INTEGER,
  album_id     INTEGER NOT NULL,
  FOREIGN KEY (album_id) REFERENCES albums(album_id) ON DELETE CASCADE
);

-- Seed data: 2 artists, 5 albums, 10 songs

INSERT INTO artists (artist_name, genre, monthly_listeners) VALUES
  ('Artist1', 'Pop', 4500000),
  ('Artist2', 'Rock', 2100000);

INSERT INTO albums (album_name, release_year, number_of_listens, artist_id) VALUES
  ('Album1', 2021, 1200000, 1),
  ('Album2',   2023,  980000, 1),
  ('Album3',     2024,  300000, 1),
  ('Album4', 2019,  750000, 2),
  ('Album5',       2022,  640000, 2);

INSERT INTO songs (song_name, release_year, album_id) VALUES
  ('Song1',       2021, 1),
  ('Song2',         2021, 1),
  ('Song3',  2021, 1),
  ('Song4',  2023, 2),
  ('Song5',       2023, 2),
  ('Song6',         2024, 3),
  ('Song7',    2019, 4),
  ('Song8',      2019, 4),
  ('Song9',      2022, 5),
  ('Song10',   2022, 5);
