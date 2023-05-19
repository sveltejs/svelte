export default {
	get props() {
		return { component: { name: 'world' } };
	},

	html: `
		<h1>Hello world!</h1>
		<input>
	`,

	ssrHtml: `
		<h1>Hello world!</h1>
		<input value=world>
	`,

	async test({ assert, component, target, window }) {
		const input = target.querySelector('input');
		assert.equal(input.value, 'world');

		const event = new window.Event('input');

		input.value = 'everybody';
		await input.dispatchEvent(event);

		assert.equal(input.value, 'everybody');
		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>Hello everybody!</h1>
			<input>
		`
		);

		component.component = { name: 'goodbye' };
		assert.equal(input.value, 'goodbye');
		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>Hello goodbye!</h1>
			<input>
		`
		);
	}
};
