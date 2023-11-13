import { ok, test } from '../../test';

export default test({
	async test({ assert, component, target }) {
		const select = target.querySelector('select');
		ok(select);

		assert.equal(select.value, '1');

		component.label = 'hoge';

		assert.equal(select.value, '1');
	}
});
