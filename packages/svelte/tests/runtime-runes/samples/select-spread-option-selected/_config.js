import { ok, test } from '../../test';

export default test({
	async test({ assert, target, instance }) {
		const select = target.querySelector('select');
		ok(select);
		assert.equal(select.selectedIndex, 1);
	}
});
