import { tick } from 'svelte';
import { test } from '../../test';

// A creates the child, then B writes a newer x without sharing A's writes. When A's
// first await resolves, its second async effect is initialized in A's private view,
// which restores x=0. B's independent ready gate then reveals the same child: B's
// second run must not abort A's still-pending first run as if it were global.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [a, b, ready, first_0, first_1, second_0, second_1] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		a.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['first 0']);

		b.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['ready 1']);

		// The continuation creates its second async effect after B has written x=1,
		// but A's view still has x=0. A has not committed its own a=true write.
		first_0.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['second 0']);

		// Resolve an independent source, not first_1: resolving both first results
		// would make the batches intersect, legitimately superseding A's run.
		ready.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['first 1', 'second 1']);

		// A can still finish and commit its older view while B's work is pending.
		second_0.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0 0 0</p>');
		assert.deepEqual(logs.splice(0), ['continued with 0 0']);

		first_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0 0 0</p>');
		assert.deepEqual(logs.splice(0), []);

		second_1.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1 1 1</p>');
		assert.deepEqual(logs.splice(0), []);
	}
});
