export default {
	compileOptions: {
		filename: 'src/components/FooSwitcher.svelte',
		scopeClass({ hash, name, filename }) {
			const minFilename = filename
				.split('/')
				.map(i => i.charAt(0).toLowerCase())
				.join('');
			return `sv-${name}-${minFilename}-${hash}`;
		},
	},
};
