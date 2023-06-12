// Carregando módulos
const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const app = express();
const admin = require('./routes/admin');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const moment = require('moment');
require('./models/Postagem');
const Postagem = mongoose.model('postagens');
require('./models/Categoria');
const Categoria = mongoose.model('categorias');
const usuarios = require('./routes/usuarios');
const passport = require('passport');
require('./config/auth')(passport);
// Configurações
const port = process.env.PORT || 8081;
const configDB = require('./config/db');
// Sessão
app.use(session({ secret: 'umaexpressaosegura', resave: true, saveUninitialized: true }));
/// Essa parte de autenticação deve ficar aqui
app.use(passport.initialize());
app.use(passport.session());
//
app.use(flash());
// Middleware
app.use((req, res, next) => {
	// variáveis globais
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	next();
});
// Body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Handlebars
app.engine(
	'handlebars',
	engine({
		defaultLayout: 'main',
		helpers: {
			formatDate: date => {
				return moment(date).format('DD/MM/YYYY');
			},
		},
	})
);
app.set('view engine', 'handlebars');
// Mongoose
// mongoose.Promise = global.Promise; // usado até mongoose 4
mongoose
	.connect(configDB.mongoURI)
	.then(() => console.log('Conectado ao Mongo'))
	.catch(err => console.log('Erro ao tentar conexão: ' + err));
// Public
app.use(express.static(path.join(__dirname, 'public')));
// Rotas
app.get('/', (req, res) => {
	Postagem.find()
		.populate('categoria')
		.sort({ data: 'desc' })
		.lean()
		.then(postagens => {
			res.render('index', { postagens: postagens });
		})
		.catch(err => {
			req.flash('error_msg', 'Ocorreu um erro ao buscar as postagens!');
			res.redirect('/404');
		});
});
app.get('/postagem/:slug', (req, res) => {
	Postagem.findOne({ slug: req.params.slug })
		.populate('categoria')
		.sort({ data: 'desc' })
		.lean()
		.then(postagem => {
			console.log(postagem);
			if (postagem) {
				res.render('postagem/index', { postagem: postagem });
			} else {
				req.flash('error_msg', 'Esta postagem não existe.');
				res.redirect('/');
			}
		})
		.catch(err => {
			req.flash('error_msg', 'Ocorreu um erro interno.');
			res.redirect('/');
		});
});
app.get('/404', (req, res) => {
	res.send('Erro 404');
});
app.get('/categorias', (req, res) => {
	Categoria.find()
		.lean()
		.then(categorias => {
			res.render('categorias/index', { categorias: categorias });
		})
		.catch(err => {
			req.flash('error_msg', 'Ocorreu um erro ao listar as categorias.');
			res.redirect('/');
		});
});
app.get('/categoria/:id', (req, res) => {
	Postagem.find({ categoria: req.params.id })
		.lean()
		.then(postagens => {
			if (postagens.length == 0) {
				new error();
			} else res.render('categorias/index', { postagens: postagens });
		})
		.catch(err => {
			req.flash('error_msg', 'Sem postagens desta categoria.');
			res.redirect('/categorias');
		});
});

app.use('/admin', admin);
app.use('/usuarios', usuarios);
// Outros
app.listen(port, () => console.log('Servidor rodando!'));
