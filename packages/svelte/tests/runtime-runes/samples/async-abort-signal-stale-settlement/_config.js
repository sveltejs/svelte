import { tick } from 'svelte';
import { test } from '../../test';

// An aborted run may fulfill with a caught fallback or reject with a different error.
// Neither result may escape into the merged view, before or after its replacement commits.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [increment, reject, resolve] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, '<p>0: 0</p><p>0: 0</p>');

		let current = 0;
		for (const stale_first of [true, false]) {
			increment.click();
			await tick();
			increment.click();
			await tick();
			assert.htmlEqual(
				output.innerHTML,
				`<p>${current}: ${current}</p><p>${current}: ${current}</p>`
			);

			if (stale_first) {
				reject.click();
				await tick();
				assert.htmlEqual(
					output.innerHTML,
					`<p>${current}: ${current}</p><p>${current}: ${current}</p>`
				);
			}

			resolve.click();
			await tick();
			current += 2;
			assert.htmlEqual(
				output.innerHTML,
				`<p>${current}: ${current}</p><p>${current}: ${current}</p>`
			);

			if (!stale_first) {
				reject.click();
				await tick();
				assert.htmlEqual(
					output.innerHTML,
					`<p>${current}: ${current}</p><p>${current}: ${current}</p>`
				);
			}

			assert.deepEqual(logs.splice(0), [
				`rejected ${current - 1} true`,
				`rejected ${current - 1} true`
			]);
		}
	}
});
