import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const my_element = /** @type HTMLElement & { object: { test: true }; } */ (
			target.querySelector('my-element')
		);
		assert.equal(my_element.getAttribute('string'), 'test');
		assert.equal(my_element.hasAttribute('object'), false);
		assert.deepEqual(my_element.object, { test: true });

		const my_link = /** @type HTMLAnchorElement & { object: { test: true }; } */ (
			target.querySelector('a')
		);
		assert.equal(my_link.getAttribute('string'), 'test');
		assert.equal(my_link.hasAttribute('object'), false);
		assert.deepEqual(my_link.object, { test: true });

		const [value1, value2] = target.querySelectorAll('value-element');
		assert.equal(value1.shadowRoot?.innerHTML, '<span>test</span>');
		assert.equal(value2.shadowRoot?.innerHTML, '<span>test</span>');

		const value_builtin = target.querySelector('div');
		assert.equal(value_builtin?.shadowRoot?.innerHTML, '<span>test</span>');
	}
});
