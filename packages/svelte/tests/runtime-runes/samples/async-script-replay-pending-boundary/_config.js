import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: { experimental: { async: true, scriptReplay: true } },
	async test({ assert, target, logs }) {
		const [fork, a_real, a_fork, b_real, c_real, discard, late] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');
		assert.deepEqual(logs.splice(0), ['load a 0']);
		fork.click();
		await tick();
		a_fork.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>pending</p>');
		a_real.click();
		await tick();
		b_real.click();
		await tick();
		c_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1/2/3/1</p>');
		assert.deepEqual(logs.splice(0), ['load a 1', 'load b 2', 'load b 1', 'load c 2']);
		discard.click();
		assert.ok(logs.includes('abort b 2'), 'a never-settling user promise is aborted synchronously');
		await tick();
		logs.length = 0;
		late.click();
		await tick();
		assert.deepEqual(logs, [], 'a retired attempt cannot begin the c stage');
		assert.htmlEqual(output.innerHTML, '<p>1/2/3/1</p>');
	}
});
