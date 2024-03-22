import { test } from '../../test';
// @ts-nocheck

export default test({
	test({ assert, component }) {
		let count = 0;

		// @ts-ignore
		component.$on('state', ({ changed }) => {
			if (changed.bar) count += 1;
		});

		component.x = true;
		assert.equal(count, 0);
	}
});
