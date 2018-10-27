export default {
	'skip-ssr': true,

	data: {
		value: 'hello!'
	},

	html: `
		<p>hello!</p>
		<p>hello!</p>
	`,

	test(assert, component, target) {
		component.set({ value: 'goodbye!' });
		assert.htmlEqual(target.innerHTML, `
			<p>goodbye!</p>
			<p>goodbye!</p>
		`);
	}
};
