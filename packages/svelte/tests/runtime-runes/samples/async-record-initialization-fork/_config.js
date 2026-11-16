import { tick } from 'svelte';
import { test } from '../../test';

// The first async effect is created after the script resumes in an uncommitted fork.
// It still belongs to that fork: adopting the branch in the real world must not abort it.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, show, hide, begin, resolve_0, resolve_1, commit, discard] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		for (const finish of [discard, commit]) {
			fork.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			assert.deepEqual(logs.splice(0), []);

			// Create the async effect only after the fork's initial traversal finished.
			begin.click();
			await tick();
			assert.deepEqual(logs.splice(0), ['load 1']);

			show.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			assert.deepEqual(logs.splice(0), ['load 0']);

			resolve_0.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b>');
			assert.deepEqual(logs.splice(0), []);

			resolve_1.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<b>0</b><p>0 1</p>');
			assert.deepEqual(logs.splice(0), ['continued 1 1']);

			finish.click();
			await tick();

			if (finish === discard) {
				assert.htmlEqual(output.innerHTML, '<b>0</b><p>0 1</p>');
				assert.deepEqual(logs.splice(0), ['abort 1']);

				hide.click();
				await tick();
				assert.htmlEqual(output.innerHTML, '<b>0</b>');
				assert.deepEqual(logs.splice(0), ['abort 0']);
			} else {
				assert.htmlEqual(output.innerHTML, '<b>1</b><p>1 1</p>');
				assert.deepEqual(logs.splice(0), ['abort 0']);
			}
		}
	}
});
