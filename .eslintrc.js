module.exports = {
	root: true,

	rules: {
		// automatically fixable stylistic rules
		'arrow-spacing': 2,
		'comma-dangle': [2, 'never'],
		'dot-notation': 2,
		'eol-last': [2, 'never'],
		indent: [2, 'tab', { SwitchCase: 1 }],
		'keyword-spacing': [2, { before: true, after: true }],
		'no-trailing-spaces': 2,
		'no-var': 2,
		'object-shorthand': [2, 'always'],
		'one-var': [2, 'never'],
		'prefer-arrow-callback': 2,
		'prefer-const': [2, { destructuring: 'all' }],
		'quote-props': [2, 'as-needed'],
		semi: [2, 'always'],
		'space-before-blocks': [2, 'always'],

		// eslint:recommended overrides
		'no-cond-assign': 0,
		'no-inner-declarations': 0,
		'no-mixed-spaces-and-tabs': [2, 'smart-tabs']
	},

	plugins: ['@typescript-eslint'],

	extends: [
		'eslint:recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:import/typescript'
		// TODO: fix typerscript files
		// 'plugin:@typescript-eslint/recommended',
	],

	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 9,
		sourceType: 'module',
		project: './tsconfig.json'
	},

	env: {
		es6: true,
		browser: true,
		node: true,
		mocha: true
	}
};