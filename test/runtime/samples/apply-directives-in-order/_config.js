export default {
	props: {
		value: ''
	},

	html: `
		<input>
		<p></p>
	`,

	ssrHtml: `
		<input value="">
		<p></p>
	`,

	async test({ assert, target, window }) {
		const input = target.querySelector('input');

		const event = new window.Event('input');
		input.value = 'h';
		await input.dispatchEvent(event);

		assert.equal(input.value, 'H');
		assert.htmlEqual(target.innerHTML, `
			<input>
			<p>H</p>
		`);

		input.value = 'he';
		await input.dispatchEvent(event);
		assert.equal(input.value, 'HE');
		assert.htmlEqual(target.innerHTML, `
			<input>
			<p>HE</p>
		`);
	}
};
