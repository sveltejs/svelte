import { test } from '../../test';

export default test({
	async test({ assert, target, component, raf }) {
		await component.condition.set(false);
		raf.tick(500);
		assert.htmlEqual(target.innerHTML, '');
	}
});
