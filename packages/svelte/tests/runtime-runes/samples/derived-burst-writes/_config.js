import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, instance, target }) {
		for (const count of [10000, 20000]) {
			instance.burst(10000);
			flushSync();
			const spans = target.querySelectorAll('span');
			assert.equal(spans.length, 1000);
			assert.ok(Array.from(spans).every((span) => span.textContent === `[${count}]`));
			assert.equal(instance.executions(), 1000);
		}
	}
});
