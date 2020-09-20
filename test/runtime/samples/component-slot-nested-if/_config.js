export default {
	html: `
    <input>
	`,
	async test({ assert, target, snapshot, component, window }) {
		const input = target.querySelector('input');

		input.value = 'a';
		await input.dispatchEvent(new window.Event('input'));

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			Display: a
		`
		);

		input.value = 'abc';
		await input.dispatchEvent(new window.Event('input'));

		assert.htmlEqual(
			target.innerHTML,
			`
			<input>
			Display: abc
		`
		);
	}
};
