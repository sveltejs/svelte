import { flushSync } from 'svelte';
import { test } from '../../test';

// Regression: subscribe() during each expression should not break reconciliation
export default test({
	async test({ assert, target }) {
		const btn = /** @type {HTMLElement} */ (target.querySelector('button'));

		btn.click();
		flushSync();

		btn.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<span>1</span><span>2</span><button>add</button>');
	}
});
