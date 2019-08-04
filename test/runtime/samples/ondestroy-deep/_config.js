import { destroyed, reset } from './destroyed.js';

export default {
	test({ assert, component }) {
		component.visible = false;
		assert.deepEqual(destroyed, ['A', 'B', 'C']);

		reset();
	}
};