const bcrypt = require('bcryptjs');

const { NODE_ENV, JWT_SECRET } = process.env;
const jwt = require('jsonwebtoken');

const SALT_ROUNDS = 10;

const User = require('../models/user');

const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ConflictError = require('../errors/conflict-error');

module.exports = {
  getCurrentUser(req, res, next) {
    User.findById(req.user._id)
      .then((users) => res.send(users))
      .catch(next);
  },

  updateCurrentUser(req, res, next) {
    const { name, email } = req.body;
    User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: 'true', runValidators: true },
    )
      .orFail(() => new NotFoundError(`Нет пользователя с таким _id: ${req.user._id}`))
      .then((user) => res.send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(err.message));
        } else {
          next(err);
        }
      });
  },

  createUser(req, res, next) {
    const {
      name,
      email,
      password,
    } = req.body;
    bcrypt.hash(password, SALT_ROUNDS)
      .then((hash) => User.create({
        name,
        email,
        password: hash,
      })
        .then((user) => res.status(201).send({
          name: user.name,
          _id: user._id,
          email: user.email,
        }))
        .catch((err) => {
          if (err.code === 11000) {
            next(new ConflictError(`Пользователь с email: ${email} существует`));
          } else if (err.name === 'ValidationError') {
            next(new BadRequestError(err.message));
          } else {
            next(err);
          }
        }));
  },

  login(req, res, next) {
    const { email, password } = req.body;
    return User.findUserByCredentials(email, password)
      .then((user) => {
        const token = jwt.sign(
          { _id: user._id },
          NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
          { expiresIn: '7d' },
        );
        res.send({ token });
      })
      .catch(next);
  },
};
