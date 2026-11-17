import { tick } from 'svelte';
import { test } from '../../test';

// A failed producer closes over const key=input in the prefix. Unrelated real
// success cannot erase that private failure. A genuine input-2 rebase must,
// however, revalidate the prefix or adopt the valid established environment;
// committing F must not retain a sticky key=1 failure or retry the failed input.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [
			fork,
			unrelated,
			replacement,
			reject_fork,
			resolve_0,
			resolve_2,
			resolve_replacement,
			commit,
			reset
		] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		for (const real_input of [0, 2]) {
			fork.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '');
			assert.deepEqual(logs.splice(0), ['prefix 1', 'load 1 #0']);

			(real_input === 0 ? unrelated : replacement).click();
			await tick();
			assert.htmlEqual(output.innerHTML, '');
			assert.deepEqual(logs.splice(0), [`prefix ${real_input}`, `load ${real_input} #0`]);

			reject_fork.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '');
			assert.deepEqual(logs.splice(0), [], 'private failure must not reach the real boundary');

			(real_input === 0 ? resolve_0 : resolve_2).click();
			await tick();
			assert.htmlEqual(output.innerHTML, `<p>${real_input}/${real_input}</p>`);

			if (real_input === 0) {
				assert.deepEqual(logs.splice(0), [], 'unrelated success must not retry key=1');
				commit.click();
				await tick();
				assert.htmlEqual(output.innerHTML, '<p>failed: original</p>');
				assert.deepEqual(logs.splice(0), ['error original']);
			} else {
				// A valid input-2 replacement may need one own request, or reuse R's
				// published result. Neither choice permits a retry of failed input 1.
				const work = logs.splice(0);
				for (const entry of work) {
					assert.ok(
						['prefix 2', 'load 2 #1'].includes(entry),
						`Unexpected replacement work: ${entry}`
					);
				}
				assert.ok(work.filter((entry) => entry === 'prefix 2').length <= 1);
				assert.ok(work.filter((entry) => entry === 'load 2 #1').length <= 1);
				if (work.includes('load 2 #1')) {
					resolve_replacement.click();
					await tick();
					assert.htmlEqual(output.innerHTML, '<p>2/2</p>');
					assert.deepEqual(logs.splice(0), []);
				}

				commit.click();
				await tick();
				assert.htmlEqual(output.innerHTML, '<p>2/2</p>');
				assert.deepEqual(
					logs.splice(0),
					[],
					'commit must neither retry nor report a superseded prefix failure'
				);
			}

			// Destroy the boundary itself, not just its child, before the next case.
			reset.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '');
			assert.deepEqual(logs.splice(0), []);
		}
	}
});
