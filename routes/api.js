const express = require('express');
const apiRouter = express.Router();
const { search } = require('../controllers/api/searchController')

apiRouter.get('/', search)

module.exports = apiRouter;