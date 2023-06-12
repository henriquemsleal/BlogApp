const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('../models/Usuario');
const Usuario = mongoose.model('usuarios');
const passport = require('passport');

router.get('/registro', (req, res) => {
	res.render('usuarios/registro');
});

router.post('/registro', (req, res) => {
	const nome = req.body.nome;
	const senha = req.body.senha;
	const senha2 = req.body.senha2;
	const email = req.body.email;
	let erros = [];
	if (!nome || nome.length == 0 || typeof nome == 'undefined' || nome == null)
		erros.push({ texto: 'Nome inválido!' });
	if (!email || email.length == 0 || typeof email == 'undefined' || email == null)
		erros.push({ texto: 'E-mail inválido!' });
	if (!senha || senha.length == 0 || typeof senha == 'undefined' || senha == null)
		erros.push({ texto: 'Senha inválida!' });
	if (senha.length < 6) erros.push({ texto: 'Senha muito curta!' });
	if (senha != senha2)
		erros.push({ texto: 'As senhas digitadas são diferentes! Tente novamente.' });
	if (erros.length > 0) res.render('usuarios/registro', { erros: erros });
	else {
		Usuario.findOne({ email: req.body.email })
			.lean()
			.then(usuario => {
				if (usuario) {
					req.flash('error_msg', 'E-mail já registrado!');
					res.redirect('/usuarios/registro');
				} else {
					const novoUsuario = new Usuario({
						nome: req.body.nome,
						email: req.body.email,
						senha: req.body.senha,
					});
					bcrypt.genSalt(10, (erro, salt) => {
						bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
							if (erro) {
								res.flash('error_msg', 'Ocorreu erro ao salvar os dados!');
								res.redirect('/usuarios/registro');
							} else {
								novoUsuario.senha = hash;
								novoUsuario
									.save()
									.then(() => {
										req.flash('success_msg', 'Usuário criado com sucesso!');
										res.redirect('/');
									})
									.catch(err => {
										res.flash('error_msg', 'Ocorreu um erro ao criar o usuário.');
										res.redirect('/usuarios/registro');
									});
							}
						});
					});
				}
			})
			.catch(err => {
				res.flash('error_msg', 'Ocorreu um erro interno.');
				res.redirect('/');
			});
	}
});

router.get('/login', (req, res) => {
	res.render('usuarios/login');
});

router.post('/login', (req, res, next) => {
	passport.authenticate('local', {
		// se autenticado:
		successRedirect: '/',
		// se erro de autenticação:
		failureRedirect: '/usuarios/login',
		failureFlash: true,
	})(req, res, next);
});

router.get('/logout', (req, res) => {
	req.logout(() => {
		req.flash('success_msg', 'Logout com sucesso.');
		res.redirect('/');
	});
});

module.exports = router;
