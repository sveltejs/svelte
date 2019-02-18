export default {
	async test({ assert, component, target }) {
		assert.htmlEqual(component.div.innerHTML, '<div>+</div><div>-</div>');

		const event = new window.Event('change');
		const input = target.querySelector('input');
		input.checked = false;
		await input.dispatchEvent(event);

		assert.htmlEqual(component.div.innerHTML, '<div>-</div><div>-</div>');
	}
};