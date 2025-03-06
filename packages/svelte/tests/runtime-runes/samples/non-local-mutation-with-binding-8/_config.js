import { flushSync } from 'svelte';
import { test } from '../../test';

// Tests that ownership is widened with $derived (on class or on its own) that contains $state
export default test({
	compileOptions: {
		dev: true
	},

	test({ assert, target, warnings }) {
		const [root, counter_context1, counter_context2, counter_binding1, counter_binding2] =
			target.querySelectorAll('button');

		counter_context1.click();
		counter_context2.click();
		counter_binding1.click();
		counter_binding2.click();
		flushSync();

		assert.equal(warnings.length, 0);

		root.click();
		flushSync();
		counter_context1.click();
		counter_context2.click();
		counter_binding1.click();
		counter_binding2.click();
		flushSync();

		assert.equal(warnings.length, 0);
	},

	warnings: []
});
