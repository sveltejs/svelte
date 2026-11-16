import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, commit, resolve, hide, reject] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		for (const finish of [resolve, reject]) {
			fork.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '');
			commit.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '<p>pending</p>');
			assert.deepEqual(logs.splice(0), ['load', 'committed']);
			finish.click();
			await tick();
			assert.htmlEqual(output.innerHTML, finish === resolve ? '<p>42</p>' : '<p>failed</p>');
			assert.deepEqual(logs.splice(0), finish === resolve ? [] : ['handled after commit']);
			hide.click();
			await tick();
			assert.htmlEqual(output.innerHTML, '');
		}
	}
});
