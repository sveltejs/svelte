module.exports = {
	root: true,
	extends: '@sveltejs',
	settings: {
		'import/core-modules': [
			'svelte',
			'svelte/internal',
			'svelte/store',
			'svelte/easing',
			'estree'
		],
		'svelte3/compiler': require('./compiler')
	},
	// workaround for https://github.com/typescript-eslint/typescript-eslint/issues/1824 and rely solely on 'indent' rule
	rules: {
		"@typescript-eslint/indent": "off"
	}
};
