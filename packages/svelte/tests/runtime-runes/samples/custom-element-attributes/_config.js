import { test } from '../../test';

export default test({
	mode: ['client', 'server'],
	async test({ assert, target }) {
		const my_element = /** @type HTMLElement & { object: { test: true }; } */ (
			target.querySelector('my-element')
		);
		const my_link = /** @type HTMLAnchorElement & { object: { test: true }; } */ (
			target.querySelector('a')
		);
		assert.equal(my_element.getAttribute('string'), 'test');
		assert.equal(my_element.hasAttribute('object'), false);
		assert.deepEqual(my_element.object, { test: true });
		assert.equal(my_link.getAttribute('string'), 'test');
		assert.equal(my_link.hasAttribute('object'), false);
		assert.deepEqual(my_link.object, { test: true });
	}
});
