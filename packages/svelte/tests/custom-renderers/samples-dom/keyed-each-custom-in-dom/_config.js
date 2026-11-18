import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

const item = (/** @type {string} */ x) => `<custom-root><b>${x}</b></custom-root>`;

export default test({
	target: 'dom',
	html: `<div>${item('a')}${item('b')}${item('c')}</div>`,
	test({ assert, component, target, serialize_dom }) {
		component.reverse();
		flushSync();
		assert.equal(serialize_dom(target), `<div>${item('c')}${item('b')}${item('a')}</div>`);

		component.remove_middle();
		flushSync();
		assert.equal(serialize_dom(target), `<div>${item('c')}${item('a')}</div>`);
	}
});
