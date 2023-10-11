const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { emailRegex } = require('../utils/constants');

const UnauthorizedError = require('../errors/unauthorized-error');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: [true, 'Поле должно быть заполнено'],
    validate: {
      validator(email) {
        return emailRegex.test(email);
      },
      message: 'Введите корректный email',
    },
  },
  password: {
    type: String,
    required: [true, 'Поле должно быть заполнено'],
    select: false,
  },
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля 2 символа'],
    maxlength: [30, 'Максимальная длина поля 30 символов'],
    required: [true, 'Поле должно быть заполнено'],
  },
}, { versionKey: false });

userSchema.statics.findUserByCredentials = async function func(email, password) {
  return this.findOne({ email })
    .select('+password')
    .then((user) => {
      if (!user || !bcrypt.compare(password, user.password)) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }

      return user;
    });
};

module.exports = mongoose.model('user', userSchema);
