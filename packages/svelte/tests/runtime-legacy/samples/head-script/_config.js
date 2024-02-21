import { test } from '../../test';

export default test({
	test({ assert, component, window }) {
		document.dispatchEvent(new Event('DOMContentLoaded'));
		assert.equal(window.document.querySelector('button')?.textContent, 'Hello world');
	}
});
