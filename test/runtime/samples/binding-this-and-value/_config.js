export default {
	html: `
		<input>
		<p>value: initial</p>
	`,

	ssrHtml: `
		<input value="initial">
		<p>value: initial</p>
	`,

	async test({ assert, target, window }) {
		const input = target.querySelector('input');
		const event = new window.Event('input');

		input.value = 'changed';
		await input.dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<input>
			<p>value: changed</p>
		`);
	}
};
