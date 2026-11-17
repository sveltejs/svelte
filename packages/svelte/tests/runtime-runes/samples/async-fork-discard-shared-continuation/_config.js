import { tick } from 'svelte';
import { test } from '../../test';

// Unlike the dependent chain, these expressions cannot read an uninitialized async
// source. Each view advances through its own script; the discarded fork's pending
// second await must not prevent the real view from reaching its third await.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, discard, real, fork_first, real_first, real_second, real_third, discarded_second] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		for (const button of [fork, fork_first, real, discard]) {
			button.click();
			await tick();
		}
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs, [2, 3, 3]);

		// The real attempt reaches its own second await only after its first
		// result. The discarded fork's second(3) stays unresolved throughout.
		real_first.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs, [2, 3, 3, 4]);

		real_second.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs, [2, 3, 3, 4, 5]);

		real_third.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>3 4 5</p>');
		assert.deepEqual(logs, [2, 3, 3, 4, 5]);

		discarded_second.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>3 4 5</p>');
		assert.deepEqual(
			logs,
			[2, 3, 3, 4, 5],
			'discarded continuation must not start its third await'
		);
	}
});
