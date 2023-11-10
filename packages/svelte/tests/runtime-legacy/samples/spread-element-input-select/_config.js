import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		const select = target.querySelector('select');
		ok(select);
		const [option1, option2] = select;

		let selections = Array.from(select.selectedOptions);

		assert.equal(selections.length, 1);
		assert.ok(!selections.includes(option1));
		assert.ok(selections.includes(option2));

		component.value = 'Hello';

		selections = Array.from(select.selectedOptions);
		assert.equal(selections.length, 1);
		assert.ok(selections.includes(option1));
		assert.ok(!selections.includes(option2));

		component.spread = { value: 'World' };

		selections = Array.from(select.selectedOptions);
		assert.equal(selections.length, 1);
		assert.ok(!selections.includes(option1));
		assert.ok(selections.includes(option2));
	}
});
