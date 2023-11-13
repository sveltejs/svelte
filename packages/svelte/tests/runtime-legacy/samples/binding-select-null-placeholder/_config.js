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
		assert.equal(options[0].disabled, true);
		assert.equal(options[1].selected, false);
		assert.equal(options[1].disabled, false);

		// placeholder option value must be blank string for native required field validation
		assert.equal(options[0].value, '');
		assert.equal(select.checkValidity(), false);

		component.foo = items[0];

		assert.equal(options[0].selected, false);
		assert.equal(options[1].selected, true);
		assert.equal(select.checkValidity(), true);
	}
});
