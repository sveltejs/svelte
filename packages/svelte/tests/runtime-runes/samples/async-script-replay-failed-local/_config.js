import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: { experimental: { async: true, scriptReplay: true } },
	async test({ assert, target, logs }) {
		const [fork, a_fork, reject, real, a_real, b_real, commit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		fork.click();
		await tick();
		a_fork.click();
		await tick();
		reject.click();
		await tick();
		real.click();
		await tick();
		a_real.click();
		await tick();
		b_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0/0/0</p>');
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0/0/0</p>');
		assert.deepEqual(logs, ['a 1', 'b 2', 'a 0', 'b 0', 'caught original']);
	}
});
