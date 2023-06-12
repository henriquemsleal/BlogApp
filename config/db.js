if (process.env.NODE_ENV == 'production') {
	module.exports = {
		mongoURI: 'mongodb://user:pass@link para o banco',
	};
} else {
	module.exports = {
		mongoURI: 'mongodb://127.0.0.1/blogapp',
	};
}
