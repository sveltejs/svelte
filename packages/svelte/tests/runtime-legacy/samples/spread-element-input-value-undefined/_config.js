import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		const input = target.querySelector('input');
		ok(input);

		component.value = undefined;

		assert.equal(input.value, '');

		component.value = 'foobar';

		assert.equal(input.value, 'foobar');
	}
});
