const signUpRouter = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { emailRegex } = require('../utils/constants');

const { createUser } = require('../controllers/users');

signUpRouter.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    email: Joi.string().required().pattern(emailRegex),
    password: Joi.string().required(),
  }),
}), createUser);

module.exports = signUpRouter;
