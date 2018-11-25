import container from './container.js';

export default {
	test({ assert, component, target }) {
		container.div = null;

		const top = component.top;
		const div = target.querySelector('div');

		component.visible = false;
		assert.equal(container.div, div);
	}
};