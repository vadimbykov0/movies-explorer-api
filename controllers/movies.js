const Movie = require('../models/movie');

const BadRequestError = require('../errors/bad-request-error');
const NotFoundError = require('../errors/not-found-error');
const ForbiddenError = require('../errors/forbidden-error');

module.exports = {
  getMovies(req, res, next) {
    const owner = req.user._id;
    Movie.find({ owner })
      .then((cards) => res.send(cards))
      .catch(next);
  },

  createMovie(req, res, next) {
    const {
      country,
      director,
      duration,
      year,
      description,
      image,
      trailerLink,
      thumbnail,
      movieId,
      nameRU,
      nameEN,
    } = req.body;
    Movie.create({
      country,
      director,
      duration,
      description,
      year,
      image,
      trailerLink,
      thumbnail,
      movieId,
      nameRU,
      nameEN,
      owner: req.user._id,
    })
      .then((movie) => res.status(201).send(movie))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          next(new BadRequestError(err.message));
        } else {
          next(err);
        }
      });
  },

  deleteMovie(req, res, next) {
    Movie.findById(req.params.movieId)
      .orFail()
      .then((card) => {
        if (!card.owner.equals(req.user._id)) {
          throw new ForbiddenError('Карточка другого пользователя');
        }
        Movie.deleteOne(card)
          .orFail()
          .then(() => {
            res.send({ message: 'Карточка успешно удалена' });
          })
          .catch((err) => {
            if (err.name === 'DocumentNotFoundError') {
              next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена`));
            } else {
              next(err);
            }
          });
      })
      .catch((err) => {
        if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError(`Карточка с _id: ${req.params.cardId} не найдена`));
        } else if (err.name === 'CastError') {
          next(new BadRequestError(`Некорректный _id карточки: ${req.params.cardId}`));
        } else {
          next(err);
        }
      });
  },
};
