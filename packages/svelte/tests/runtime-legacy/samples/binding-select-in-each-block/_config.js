import { test } from '../../test';

export default test({
	ssrHtml: `
		<select>
			<option selected value='hullo'>Hullo</option>
			<option value='world'>World</option>
		</select>

		<select>
			<option value='hullo'>Hullo</option>
			<option selected value='world'>World</option>
		</select>
	`,

	get props() {
		return {
			items: [{ value: 'hullo' }, { value: 'world' }]
		};
	},

	test({ assert, component, target, window, variant }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<select>
				<option ${variant === 'hydrate' ? 'selected ' : ''}value='hullo'>Hullo</option>
				<option value='world'>World</option>
			</select>

			<select>
				<option value='hullo'>Hullo</option>
				<option ${variant === 'hydrate' ? 'selected ' : ''}value='world'>World</option>
			</select>
		`
		);
		const selects = [...target.querySelectorAll('select')];

		const change = new window.Event('change');

		selects[1].options[0].selected = true;
		selects[1].dispatchEvent(change);

		assert.deepEqual(component.items, [{ value: 'hullo' }, { value: 'hullo' }]);
	}
});
