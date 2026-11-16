import { tick } from 'svelte';
import { test } from '../../test';

// The real result is already available when the creator is discarded. The script
// resumes after the notifying batch commits, while an unrelated fork is still live.
// That fork can see the onscreen branch but never waited for this script.
export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [creator, real, first, unrelated, discard_creator, second, discard_unrelated] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');

		creator.click();
		await tick();
		real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>pending</p>');
		assert.deepEqual(logs.splice(0), ['load 1', 'load 0']);

		first.click();
		await tick();
		unrelated.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>pending</p>');
		assert.deepEqual(logs.splice(0), []);

		discard_creator.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>pending</p>');
		assert.deepEqual(logs.splice(0), ['load 10']);

		second.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>0 10 0</p>');
		assert.deepEqual(logs.splice(0), ['continued 0 10 0']);

		discard_unrelated.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<i>0</i><b>0</b><p>0 10 0</p>');
		assert.deepEqual(logs, []);
	}
});
