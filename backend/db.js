// db.js
// This file connects to the SQLite database file and, the very first
// time the app is run, creates the tables using model.sql.

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

// Make sure the "data" folder exists before we try to put a file in it.
const dataFolder = path.join(__dirname, 'data');
if (!fs.existsSync(dataFolder)) {
  fs.mkdirSync(dataFolder);
}

const dbPath = path.join(dataFolder, 'app.db');
const db = new Database(dbPath);

// SQLite does not check foreign keys unless we turn it on ourselves.
// We need this ON so that ON DELETE CASCADE actually works.
db.pragma('foreign_keys = ON');

function initDb() {
  // Check if already created the "artists" table before.
  var existingTable = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'artists'")
    .get();

  if (existingTable) {
    console.log('Database already set up, skipping model.sql');
  } else {
    var sqlFileContents = fs.readFileSync(path.join(__dirname, 'model.sql'), 'utf8');
    db.exec(sqlFileContents);
    console.log('Database created and seed data added');
  }
}

module.exports = {
  db: db,
  initDb: initDb
};
