export default {
	skip: true, // JSDOM...

	html: `
		<select>
			<option value='hullo'>Hullo</option>
			<option value='world'>World</option>
		</select>

		<select>
			<option value='hullo'>Hullo</option>
			<option value='world'>World</option>
		</select>
	`,

	data: {
		items: [{ value: 'hullo' }, { value: 'world' }]
	},

	test(assert, component, target, window) {
		const selects = [...target.querySelectorAll('select')];

		const change = new window.Event('change');

		selects[1].options[0].selected = true;
		selects[1].dispatchEvent(change);

		assert.deepEqual(component.get().items, [
			{ value: 'hullo' }, { value: 'hullo' }
		]);
	}
};
