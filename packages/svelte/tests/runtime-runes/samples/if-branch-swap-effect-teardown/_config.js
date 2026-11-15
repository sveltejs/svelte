import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	skip_async: true,
	html: `<button>swap</button><output><p>A</p></output><p id="current">current: A</p>`,

	test({ assert, target }) {
		const [btn] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		flushSync(() => btn.click());

		assert.htmlEqual(output.innerHTML, `<p>B - no registration, no C</p>`);
		assert.htmlEqual(
			/** @type {HTMLElement} */ (target.querySelector('#current')).outerHTML,
			`<p id="current">current: null</p>`
		);
	}
});
