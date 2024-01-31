import { test } from '../../test';

export default test({
	async test({ assert, target, component }) {
		assert.equal(target.querySelector('img'), component.items[0].img);
	}
});
