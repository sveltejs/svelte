export default {
	html: `
		<label>firstname <input></label>
		<label>lastname <input></label>
	`,

	test ( assert, component, target, window ) {
		const input = new window.Event( 'input' );
		const inputs = target.querySelectorAll( 'input' );

		inputs[0].value = 'Ada';
		inputs[0].dispatchEvent(input);
		assert.deepEqual(component.get().values, {
			firstname: 'Ada',
			lastname: ''
		});

		inputs[1].value = 'Lovelace';
		inputs[1].dispatchEvent(input);
		assert.deepEqual(component.get().values, {
			firstname: 'Ada',
			lastname: 'Lovelace'
		});

		component.set({
			values: {
				firstname: 'Grace',
				lastname: 'Hopper'
			}
		});
		assert.equal(inputs[0].value, 'Grace');
		assert.equal(inputs[1].value, 'Hopper');
	}
};
