import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: { experimental: { async: true, scriptReplay: true } },
	async test({ assert, target, logs }) {
		const [fork, real, reject_fork, resolve_real, commit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		fork.click();
		await tick();
		real.click();
		await tick();
		reject_fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs.splice(0), ['load 1', 'load 0']);
		resolve_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p>');
		commit.click();
		await tick();
		assert.deepEqual(logs, ['handled original']);
		assert.htmlEqual(output.innerHTML, '<p>private failure</p>');
	}
});
