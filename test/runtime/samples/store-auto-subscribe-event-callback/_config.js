export default {
	html: `
	<input class="input" placeholder="Type here" type="text">
	Dirty: false
	Valid: false
	`,

	async test({ assert, target, window }) {
		const input = target.querySelector('input');

		input.value = 'foo';
		const inputEvent = new window.InputEvent('input');

		await input.dispatchEvent(inputEvent);

		assert.htmlEqual(target.innerHTML, `
		<input class="input" placeholder="Type here" type="text">
		Dirty: true
		Valid: true
		`);
	}
};
