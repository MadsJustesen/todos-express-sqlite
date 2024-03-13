const sqlite3 = require('sqlite3');
const mkdirp = require('mkdirp');

mkdirp.sync('./var/db');

const db = new sqlite3.Database('./var/db/todos.db');

db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS todos ( \
    id INTEGER PRIMARY KEY, \
    title TEXT NOT NULL, \
    completed INTEGER, \
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, \
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, \
    synchronized INTEGER \
  )"); // I added the extra fields in the create statement. In a production app, I would do migrations instead

  db.run("DROP TRIGGER IF EXISTS set_updated_at_on_todos") // To prevent conflict on create trigger, this would not be needed if implemented via a migration
  db.run("CREATE TRIGGER set_updated_at_on_todos \
    UPDATE OF completed, title \
    ON todos \
    BEGIN \
      UPDATE todos SET updated_at = CURRENT_TIMESTAMP WHERE id = old.id; \
    END")
});

module.exports = db;
