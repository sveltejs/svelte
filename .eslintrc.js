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
	}
};
