import { ok, test } from '../../test';

export default test({
	get props() {
		return {
			options: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
			selected: 'b'
		};
	},

	test({ assert, component, target, window }) {
		const select = target.querySelector('select');
		ok(select);
		assert.equal(select.value, 'b');

		const event = new window.Event('change');

		select.value = 'c';
		select.dispatchEvent(event);

		assert.equal(select.value, 'c');
		assert.equal(component.lastChangedTo, 'c');
		assert.equal(component.selected, 'c');
	}
});
