import { test } from '../../test';
import container from './container.js';

export default test({
	test({ assert, component, target }) {
		container.div = null;

		const div = target.querySelector('div');

		component.visible = false;
		assert.equal(container.div, div);
	}
});
