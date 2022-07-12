const { Router } = require('express');
const Item = require('../models/Item');
const authenticate = require('../middleware/authenticate');
const authorizeItem = require('../middleware/authorizeItem');

module.exports = Router()
  .get('/', authenticate, async (req, res, next) => {
    try {
      const item = await Item.getAll(req.user.id); //where is user id coming from
      res.json(item);
    } catch (error) {
      next(error);
    }
  })

  .post('/', authenticate, async (req, res, next) => {
    try {
      const addingItem = await Item.insert({
        ...req.body,
        user_id: req.user.id,
      });
      res.json(addingItem);
    } catch (error) {
      next(error);
    }
  })

  .put('/:id', authenticate, authorizeItem, async (req, res, next) => {
    try {
      const item = await Item.updateById(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      next(error);
    }
  })

  .delete('/:id', authenticate, authorizeItem, async (req, res, next) => {
    try {
      const item = await Item.deleteById(req.params.id);
      res.json(item);
    } catch (error) {
      next(error);
    }
  });
