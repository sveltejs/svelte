export default {
	html: '',

	async test({ assert, component, target, window }) {
		component.visible = true;
		const input = target.querySelector('input');
		async function dispatchEvent(value) {
			input.value = value;
			const inputEvent = new window.InputEvent("input");
			await input.dispatchEvent(inputEvent);
		}

		assert.equal(window.document.activeElement.getAttribute('title'), 'text');

		await dispatchEvent('dynamic');
		assert.equal(window.document.activeElement.getAttribute('title'), 'dynamic');

		await dispatchEvent('bound');
		assert.equal(window.document.activeElement.getAttribute('title'), 'bound');

		await dispatchEvent('fn');
		assert.equal(window.document.activeElement.getAttribute('title'), 'fn');
	}
};
