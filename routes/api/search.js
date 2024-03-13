const express = require('express');
const searchRouter = express.Router();
const { search } = require('../../controllers/api/searchController')

searchRouter.get('/', search)

module.exports = searchRouter;