const { search } = require('../../models/todo')

exports.search = (req, res) => {
  searchQuery = req.query.q;
  if (searchQuery != null && searchQuery.trim().length > 0) {
    search(searchQuery, function(err, result) {
      if (err) {return res.json(err.message)}
      return res.json(result)
    })
  } else {
    return res.json({ error: { message: "Missing search query"}})
  }
}