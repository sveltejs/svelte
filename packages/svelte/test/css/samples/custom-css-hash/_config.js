export default {
	compileOptions: {
		filename: 'src/components/FooSwitcher.svelte',
		cssHash({ hash, css, name, filename }) {
			const min_filename = filename
				.split('/')
				.map((i) => i.charAt(0).toLowerCase())
				.join('');
			return `sv-${name}-${min_filename}-${hash(css)}`;
		}
	}
};
