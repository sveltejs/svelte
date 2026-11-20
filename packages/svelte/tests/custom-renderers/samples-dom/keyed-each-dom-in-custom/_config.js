import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

const item = (/** @type {string} */ x) => `<dom-host><div>${x}</div></dom-host>`;

export default test({
	html: `<custom>${item('a')}${item('b')}${item('c')}</custom>`,
	test({ assert, component, target, serialize }) {
		component.reverse();
		flushSync();
		assert.equal(serialize(target), `<custom>${item('c')}${item('b')}${item('a')}</custom>`);
	}
});
