const usersRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { emailRegex } = require('../utils/constants');

const {
  getCurrentUser,
  updateCurrentUser,
} = require('../controllers/users');

usersRouter.get('/me', getCurrentUser);

usersRouter.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().pattern(emailRegex),
  }),
}), updateCurrentUser);

module.exports = usersRouter;
