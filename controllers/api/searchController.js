var db = require('../../db');

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

exports.search = (req, res) => {
    searchQuery = req.query.q;
    if (searchQuery != null && searchQuery.trim().length > 0) {
        db.all("SELECT * FROM todos WHERE title LIKE ? LIMIT 10", ["%".concat(searchQuery, "%")], function(err, rows) {
        if (err) {return res.json(err.message)}
        return res.json(mapRows(rows))
        });
    } else {
        return res.json({ error: { message: "Missing search query"}})
    }
}