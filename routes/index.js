const router = require('express').Router();
const auth = require('../middlewares/auth');

const signUpRouter = require('./signup');
const signInRouter = require('./signin');
const usersRouter = require('./users');
const moviesRouter = require('./movies');

const NotFoundError = require('../errors/not-found-error');

router.use('/signup', signUpRouter);
router.use('/signin', signInRouter);

router.use(auth);

router.use('/users', usersRouter);
router.use('/movies', moviesRouter);

router.use('*', (req, res, next) => {
  next(new NotFoundError('Запрашиваемый ресурс не найден'));
});

module.exports = router;
