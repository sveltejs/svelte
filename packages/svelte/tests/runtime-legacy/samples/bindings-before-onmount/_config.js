import { test } from '../../test';

export default test({
	async test({ assert, component }) {
		assert.equal(component.one.snapshot, 2);
	}
});
