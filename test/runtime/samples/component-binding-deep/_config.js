export default {
	html: `
		<input>
		<p>foo</p>
	`,

	ssrHtml: `
		<input value=foo>
		<p>foo</p>
	`,

	async test({ assert, component, target, window }) {
		const event = new window.MouseEvent('input');
		const input = target.querySelector('input');

		input.value = 'blah';
		await input.dispatchEvent(event);

		assert.deepEqual(component.deep, { name: 'blah' });
		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			<p>blah</p>
		`
		);
	}
};
