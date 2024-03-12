var express = require('express');
var router = express.Router();
var db = require('../db');
var axios = require('axios')
const { render } = require('ejs');

function fetchTodos(req, res, next) {
  db.all('SELECT * FROM todos', [], function(err, rows) {
    if (err) { return next(err); }
    
    var todos = rows.map(function(row) {
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
    res.locals.todos = todos;
    res.locals.activeCount = todos.filter(function(todo) { return !todo.completed; }).length;
    res.locals.completedCount = todos.length - res.locals.activeCount;
    next();
  });
}

/* GET home page. */
router.get('/', fetchTodos, function(req, res, next) {
  res.locals.filter = null;
  res.render('index');
});

router.get('/active', fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return !todo.completed; });
  res.locals.filter = 'active';
  res.render('index');
});

router.get('/completed', fetchTodos, function(req, res, next) {
  res.locals.todos = res.locals.todos.filter(function(todo) { return todo.completed; });
  res.locals.filter = 'completed';
  res.render('index');
});

router.post('/', function(req, res, next) {
  req.body.title = req.body.title.trim();
  next();
}, function(req, res, next) {
  if (req.body.title !== '') { return next(); }
  return res.redirect('/' + (req.body.filter || ''));
}, function(req, res, next) {
  db.run('INSERT INTO todos (title, completed) VALUES (?, ?)', [
    req.body.title,
    req.body.completed == true ? 1 : null
  ], function(err) {
    if (err) { return next(err); }
    lastId = this.lastID
    db.get('SELECT * FROM todos where ID = ?', [lastId], function(err, row) {
      axios.post('https://postman-echo.com/post', row)
        .then(function(response) {
          if (response.status == 200) {
            db.run('UPDATE todos SET synchronized = 1 WHERE id = ?', [lastId]);
          }
        });
    })
    next();
  });
}, function(req, res, next) {
  return res.redirect('/' + (req.body.filter || ''));
});

router.post('/:id(\\d+)', function(req, res, next) {
  req.body.title = req.body.title.trim();
  next();
}, function(req, res, next) {
  if (req.body.title !== '') { return next(); }
  db.run('DELETE FROM todos WHERE id = ?', [
    req.params.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
}, function(req, res, next) {
  db.run('UPDATE todos SET title = ?, completed = ? WHERE id = ?', [
    req.body.title,
    req.body.completed !== undefined ? 1 : null,
    req.params.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

router.post('/:id(\\d+)/delete', function(req, res, next) {
  db.run('DELETE FROM todos WHERE id = ?', [
    req.params.id
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

router.post('/toggle-all', function(req, res, next) {
  db.run('UPDATE todos SET completed = ?', [
    req.body.completed !== undefined ? 1 : null
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

router.post('/clear-completed', function(req, res, next) {
  db.run('DELETE FROM todos WHERE completed = ?', [
    1
  ], function(err) {
    if (err) { return next(err); }
    return res.redirect('/' + (req.body.filter || ''));
  });
});

// Api. In a production app, I would reorganize routes, e.g. separate folders for 'api routes' and 'frontend routes'
router.get('/search', fetchTodos, function(req, res, next) {
  searchQuery = req.query.q;
  if (searchQuery != null && searchQuery.trim().length > 0) {
    // Using filter on fetchTodos function. A query with something like "SELECT * FROM todos WHERE title LIKE %q%" would be preferred on a bigger database
    res.json(res.locals.todos.filter(function(todo) { return todo.title.includes(searchQuery); }));
  } else {
    res.json({ error: { message: "Missing search query"}})
  }
})


module.exports = router;
