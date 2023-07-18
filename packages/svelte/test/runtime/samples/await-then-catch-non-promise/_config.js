export default {
	get props() {
		return { thePromise: 'not actually a promise' };
	},

	html: `
		<p>the value is not actually a promise</p>
	`,

	test({ assert, component, target }) {
		component.thePromise = 'still not a promise';

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>the value is still not a promise</p>
		`
		);
	}
};
