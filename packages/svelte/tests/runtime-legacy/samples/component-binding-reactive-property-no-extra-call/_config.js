import { test } from '../../test';

export default test({
	async test({ assert, component }) {
		assert.equal(component.object_updates, component.primitive_updates);
	}
});
