import { flushSync } from 'svelte';
import { fire } from '../../platform';
import { test } from '../../suite';

export default test({
	html: '<button>0</button>',
	test({ assert, platform_root }) {
		const button = /** @type {import('../../platform').PElement} */ (platform_root.children[0]);

		// the platform fires the handlers it received
		fire(button, 'press', { amount: 2 });
		flushSync();
		assert.equal(button.children.map((node) => node.kind === 'text' && node.text).join(''), '2');
	}
});
