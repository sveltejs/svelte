import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, real, resolve_real, resolve_fork, commit, update, resolve_update] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		fork.click();
		await tick();
		real.click();
		await tick();
		resolve_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<button>edit local</button><p>2|2|2|2</p>');
		assert.deepEqual(logs.splice(0), ['init 1', 'load 1', 'init 2', 'load 2']);
		const [node] = output.querySelectorAll('p');
		const [edit] = output.querySelectorAll('button');
		edit.click();
		await tick();
		assert.equal(node.textContent, '2|2|3|2');
		resolve_fork.click();
		await tick();
		commit.click();
		await tick();
		assert.equal(node.textContent, '1|2|3|1');
		assert.equal(output.querySelector('p'), node);
		assert.deepEqual(logs.splice(0), []);
		update.click();
		await tick();
		resolve_update.click();
		await tick();
		assert.equal(node.textContent, '3|2|3|3');
		assert.equal(output.querySelector('p'), node);
		assert.deepEqual(
			logs,
			['load 3'],
			'publication freezes initialization, not reactive producers'
		);
	}
});
