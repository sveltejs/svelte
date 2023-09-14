export default {
	html: `
	<input class="input" placeholder="Type here" type="text">
	Dirty: false
	Valid: false
	`,

	async test({ assert, target, window }) {
		const input = target.querySelector('input');

		input.value = 'foo';
		const input_event = new window.InputEvent('input');

		await input.dispatchEvent(input_event);

		assert.htmlEqual(
			target.innerHTML,
			`
		<input class="input" placeholder="Type here" type="text">
		Dirty: true
		Valid: true
		`
		);
	}
};
