const db = require('../db');

function mapRows(rows) {
  return rows.map(function(row) {
    return {
      id: row.id,
      title: row.title,
      completed: row.completed == 1 ? true : false,
      url: '/' + row.id,
      created_at: row.created_at,
      updated_at: row.updated_at,
      synchronized: row.synchronized
    }
  });
}

exports.search = (phrase, callback) => {
  db.all("SELECT * FROM todos WHERE title LIKE ? LIMIT 10", ["%".concat(phrase, "%")], function(err, rows) {
    if (err) { return err.message }
    callback(err, mapRows(rows))
  });
}
