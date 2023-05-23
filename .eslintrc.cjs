module.exports = {
	root: true,
	extends: ['@sveltejs'],
	settings: {
		'import/core-modules': [
			'svelte',
			'svelte/internal',
			'svelte/store',
			'svelte/easing',
			'estree'
		]
	},
	rules: {
		'@typescript-eslint/no-non-null-assertion': 'off'
	}
};
