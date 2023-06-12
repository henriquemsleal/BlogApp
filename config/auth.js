const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');

module.exports = function (passport) {
	passport.use(
		new localStrategy(
			{ usernameField: 'email', passwordField: 'senha' },
			(email, senha, done) => {
				Usuario.findOne({ email: email }).then(usuario => {
					if (!usuario)
						return done(null, false, { message: 'Esse e-mail não está registrado!' });

					bcrypt.compare(senha, usuario.senha, (erro, confere) => {
						if (confere) return done(null, usuario);
						else return done(null, false, { message: 'Senha incorreta.' });
					});
				});
			}
		)
	);

	// funções para salvar os dados do usuário numa sessão
	passport.serializeUser((usuario, done) => done(null, usuario.id));
	passport.deserializeUser((id, done) =>
		Usuario.findById(id)
			.lean()
			.then(usuario => {
				if (usuario) done(null, usuario);
				else done(err, usuario);
			})
	);
};
