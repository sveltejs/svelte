import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: { experimental: { async: true, scriptReplay: true } },
	async test({ assert, target, logs }) {
		const [fork, reject, commit, supersede, resolve, finish] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		fork.click();
		await tick();
		reject.click();
		await tick();
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		supersede.click();
		await tick();
		resolve.click();
		await tick();
		finish.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p><span>ready</span>');
		assert.deepEqual(logs, ['load 1', 'wait', 'load 2', 'committed']);
	}
});
