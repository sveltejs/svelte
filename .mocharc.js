module.exports = {
	diff: true,
	extension: ['js'],
	package: './package.json',
	reporter: 'spec',
	slow: 75,
	timeout: 2000,
	ui: 'bdd',
	file: [
		'test/test.js'
	]
};
