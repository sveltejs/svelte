import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	compileOptions: { experimental: { async: true, scriptReplay: true } },
	async test({ assert, target, logs }) {
		const [fork, real, resolve_real, resolve_fork, commit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		fork.click();
		await tick();
		real.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load 1', 'load 0']);
		resolve_real.click();
		await tick();
		assert.equal(output.querySelector('p')?.textContent, '0/0/0/0');
		assert.deepEqual(logs.splice(0), ['created']);
		const [node] = output.querySelectorAll('p');
		const [branch] = output.querySelectorAll('i');
		const [edit] = output.querySelectorAll('button');
		edit.click();
		await tick();
		assert.equal(node.textContent, '0/0/0/1');
		resolve_fork.click();
		await tick();
		assert.equal(node.textContent, '0/0/0/1');
		commit.click();
		await tick();
		assert.equal(node.textContent, '1/2/0/1');
		assert.equal(output.querySelector('p'), node);
		assert.equal(output.querySelector('i'), branch);
		assert.deepEqual(logs, [], 'neither the loader nor content factory reruns on commit');
	}
});
