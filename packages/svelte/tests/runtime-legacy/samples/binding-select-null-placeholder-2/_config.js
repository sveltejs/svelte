import { ok, test } from '../../test';

const items = [{ id: 'a' }, { id: 'b' }];

export default test({
	get props() {
		return {
			/** @type {{ id: string } | null} */
			foo: null,
			items
		};
	},

	test({ assert, component, target }) {
		const select = target.querySelector('select');
		ok(select);

		const options = target.querySelectorAll('option');

		assert.equal(options[0].selected, true);
		assert.equal(options[1].selected, false);
		assert.equal(options[0].value, '');

		component.foo = component.items[0];
		assert.equal(options[0].selected, false);
		assert.equal(options[1].selected, true);

		component.foo = { id: 'c' }; // doesn't match an option
		assert.equal(select.value, '');
		assert.equal(select.selectedIndex, -1);
		assert.equal(options[0].selected, false);
		assert.equal(options[1].selected, false);
	}
});
