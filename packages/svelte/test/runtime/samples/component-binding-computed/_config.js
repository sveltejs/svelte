export default {
	html: `
		<label>firstname <input></label>
		<label>lastname <input></label>
	`,
	ssrHtml: `
		<label>firstname <input value=""></label>
		<label>lastname <input value=""></label>
	`,

	async test({ assert, component, target, window }) {
		const input = new window.Event('input');
		const inputs = target.querySelectorAll('input');

		inputs[0].value = 'Ada';
		await inputs[0].dispatchEvent(input);
		assert.deepEqual(component.values, {
			firstname: 'Ada',
			lastname: ''
		});

		inputs[1].value = 'Lovelace';
		await inputs[1].dispatchEvent(input);
		assert.deepEqual(component.values, {
			firstname: 'Ada',
			lastname: 'Lovelace'
		});

		component.values = {
			firstname: 'Grace',
			lastname: 'Hopper'
		};
		assert.equal(inputs[0].value, 'Grace');
		assert.equal(inputs[1].value, 'Hopper');
	}
};
