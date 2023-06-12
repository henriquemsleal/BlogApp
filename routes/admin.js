const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias');
require('../models/Postagem');
const Postagem = mongoose.model('postagens');
const { eAdmin } = require('../helpers/eAdmin');

router.get('/', eAdmin, (req, res) => {
	res.render('admin/index');
});

router.get('/categorias', eAdmin, (req, res) => {
	Categoria.find()
		.sort({ date: 'desc' })
		.lean()
		.then(categorias => res.render('admin/categorias', { categorias: categorias }))
		.catch(err => {
			req.flash('error_msg', 'Ocorreu um erro ao listar categorias!');
			res.redirect('/admin');
		});
});

router.get('/categorias/add', eAdmin, (req, res) => {
	res.render('admin/addcategorias');
});

router.post('/categorias/nova', eAdmin, (req, res) => {
	var erros = [];
	if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
		erros.push({ texto: 'Nome inválido' });
	}

	if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
		erros.push({ texto: 'Slug inválido' });
	}

	if (req.body.nome.length < 2) {
		erros.push({ texto: 'Nome da categoria é muito pequeno' });
	}

	if (erros.length > 0) {
		res.render('admin/addcategorias', { erros: erros });
	} else {
		const novaCategoria = {
			nome: req.body.nome,
			slug: req.body.slug,
		};

		new Categoria(novaCategoria)
			.save()
			.then(() => {
				req.flash('success_msg', 'Categoria criada com sucesso!');
				res.redirect('/admin/categorias');
			})
			.catch(err => {
				req.flash('error_msg', 'Ocorreu um erro! Tente novamente.');
				res.redirect('/admin');
			});
	}
});

router.get('/categorias/edit/:id', eAdmin, (req, res) => {
	Categoria.findOne({ _id: req.params.id })
		.lean()
		.then(categoria => res.render('admin/editcategorias', { categoria: categoria }))
		.catch(err => {
			req.flash('error_msg', 'Essa categoria não existe!');
			res.redirect('/admin/categorias');
		});
});

router.post('/categorias/edit', eAdmin, (req, res) => {
	Categoria.findOne({ _id: req.body.id })
		.then(categoria => {
			categoria.nome = req.body.nome;
			categoria.slug = req.body.slug;

			categoria
				.save()
				.then(() => {
					req.flash('success_msg', 'Categoria alterada com sucesso!');
					res.redirect('/admin/categorias');
				})
				.catch(err => {
					req.flash('error_msg', 'Ocorreu um erro interno ao tentar salvar.');
					res.redirect('/admin/categorias');
				});
		})
		.catch(err => {
			req.flash('error_msg', 'Ocorreu um erro ao editar!');
			res.redirect('/admin/categorias');
		});
});

router.post('/categorias/deletar', eAdmin, (req, res) => {
	Categoria.deleteOne({ _id: req.body.id })
		.then(() => {
			req.flash('success_msg', 'Categoria deletada com sucesso!');
			res.redirect('/admin/categorias');
		})
		.catch(err => {
			req.flash('error_msg', 'Ocorreu um erro ao tentar deletar.');
			res.redirect('/admin/categorias');
		});
});

router.get('/postagens', eAdmin, (req, res) => {
	Postagem.find()
		.populate('categoria')
		.sort({ data: 'desc' })
		.lean()
		.then(postagens => {
			res.render('admin/postagens', { postagens: postagens });
		})
		.catch(err => {
			req.flash('error_msg', 'Ocorreu um erro ao listar as postagens.');
			res.redirect('/admin');
		});
});

router.get('/postagens/add', eAdmin, (req, res) => {
	Categoria.find()
		.lean()
		.then(categorias => {
			res.render('admin/addpostagens', { categorias: categorias });
		})
		.catch(err => {
			req.flash('error_msg', 'Ocorreu um erro ao salvar.');
			res.redirect('/admin');
		});
});

router.post('/postagens/nova', eAdmin, (req, res) => {
	var erros = [];
	if (req.body.categoria == '0') {
		erros.push({ texto: 'Categoria inválida! Registre uma categoria.' });
	}
	if (erros.length > 0) {
		res.render('admin/addpostagens', { erros: erros });
	} else {
		const novaPostagem = {
			titulo: req.body.titulo,
			slug: req.body.slug,
			descricao: req.body.descricao,
			conteudo: req.body.conteudo,
			categoria: req.body.categoria,
		};
		new Postagem(novaPostagem)
			.save()
			.then(() => {
				req.flash('success_msg', 'Postagem salva com sucesso!');
				res.redirect('/admin/postagens');
			})
			.catch(err => {
				req.flash('error_msg', 'Ocorreu um erro ao salvar!');
				res.redirect('/admin/postagens');
			});
	}
});

router.get('/postagens/edit/:id', eAdmin, (req, res) =>
	Postagem.findOne({ _id: req.params.id })
		.lean()
		.then(postagem => {
			Categoria.find()
				.lean()
				.then(categorias => {
					res.render('admin/editpostagens', {
						postagem: postagem,
						categorias: categorias,
					});
				})
				.catch(err => {
					req.flash('error_msg', 'Ocorreu um erro ao listar as categorias.');
					req.redirect('/admin/postagens');
				});
		})
		.catch(err => {
			req.flash('error_msg', 'Ocorreu um erro ao carregar o formulário.');
			res.redirect('/admin/postagens');
		})
);

router.post('/postagens/edit', eAdmin, (req, res) => {
	Postagem.findOne({ _id: req.body.id })
		.then(postagem => {
			postagem.titulo = req.body.titulo;
			postagem.slug = req.body.slug;
			postagem.descricao = req.body.descricao;
			postagem.conteudo = req.body.conteudo;
			postagem.categoria = req.body.categoria;

			postagem
				.save()
				.then(() => {
					req.flash('success_msg', 'Postagem alterada com sucesso!');
					res.redirect('/admin/postagens');
				})
				.catch(err => {
					req.flash('error_msg', 'Ocorreu um erro ao tentar salvar.');
					res.redirect('/admin/postagens');
				});
		})
		.catch(err => {
			req.flash('error_msg', 'Ocorreu um erro ao tentar salvar!');
			res.redirect('/admin/postagens');
		});
});

router.post('/postagens/deletar', eAdmin, (req, res) => {
	Postagem.deleteOne({ _id: req.body.id })
		.then(() => {
			req.flash('success_msg', 'Postagem deletada com sucesso!');
			res.redirect('/admin/postagens');
		})
		.catch(err => {
			req.flash('error_msg', 'Ocorreu um erro ao tentar deletar.');
			res.redirect('/admin/postagens');
		});
});

/* 
// ou
		router.get('/postagens/deletar/:id', (req, res) => {
	Postagem.remove({ _id: req.params.id }).then(() => {
		res.redirect('/admin/postagens');
	});
}); */

module.exports = router;
