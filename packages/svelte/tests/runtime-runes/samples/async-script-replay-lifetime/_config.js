import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, real, resolve_fork, resolve_real, commit, update, resolve_update, hide] =
			target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		fork.click();
		await tick();
		resolve_fork.click();
		await tick();
		assert.deepEqual(logs, [], 'speculative lifecycle registrations must not run');
		real.click();
		await tick();
		resolve_real.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>0</p>');
		const [node] = output.querySelectorAll('p');
		assert.deepEqual(logs.splice(0), ['mounted']);
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>1</p>');
		assert.deepEqual(logs, [], 'an old successful fork cannot replace the established lifetime');
		update.click();
		await tick();
		resolve_update.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>2</p>');
		assert.equal(output.querySelector('p'), node);
		assert.deepEqual(logs, []);
		hide.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs, ['destroyed']);
	}
});
