const { search } = require('../../models/todo')

exports.search = (req, res) => {
  searchPhrase = req.query.q;
  if (searchPhrase != null && searchPhrase.trim().length > 0) {
    search(searchPhrase, function(err, result) {
      if (err) {return res.json(err.message)}
      return res.json(result)
    })
  } else {
    return res.json({ error: { message: "Missing search query"}})
  }
}