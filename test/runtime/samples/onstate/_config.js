export default {
	'skip-ssr': true,

	data: {
		foo: 'woo!'
	},

	html: `
		<p>woo!</p>
		<p>WOO!</p>
	`,

	test(assert, component, target) {
		component.set({ foo: 'yeah!' });
		assert.htmlEqual(target.innerHTML, `
			<p>yeah!</p>
			<p>YEAH!</p>
		`);
	}
};
