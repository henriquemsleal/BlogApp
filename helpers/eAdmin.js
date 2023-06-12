module.exports = {
	eAdmin: function (req, res, next) {
		if (req.isAuthenticated() && req.user.eAdmin == 1) {
			return next();
		}

		req.flash('error_msg', 'Acesso restrito a Administradores.');
		res.redirect('/');
	},
};
