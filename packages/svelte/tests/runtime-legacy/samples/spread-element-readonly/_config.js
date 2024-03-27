import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'], // DOM and SSR output is different, a separate SSR test exists
	html: '<input form="qux" list="quu" />',

	test({ assert, target }) {
		const div = /** @type {HTMLDivElement & { value: string }} */ (target.querySelector('input'));
		assert.equal(div.value, 'bar');
	}
});
