import { test } from '../../test';
import { destroyed, reset } from './destroyed.js';

export default test({
	test({ assert, component }) {
		// for hydration, ssr may have pushed to `destroyed`
		reset();

		component.visible = false;
		assert.deepEqual(destroyed, ['A', 'B', 'C']);

		reset();
	}
});
