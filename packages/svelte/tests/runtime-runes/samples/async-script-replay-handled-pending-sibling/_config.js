import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [fork, reject, commit] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		fork.click();
		await tick();
		reject.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '');
		assert.deepEqual(logs, []);
		commit.click();
		await tick();
		assert.htmlEqual(output.innerHTML, '<p>failed</p>');
		assert.deepEqual(
			logs.filter((value) => value === 'original error'),
			['original error']
		);
		assert.deepEqual(
			logs.filter((value) => value === 'cancelled sibling'),
			['cancelled sibling']
		);
		assert.deepEqual(
			logs.filter((value) => value === 'committed'),
			['committed']
		);
		assert.equal(logs.length, 3);
	}
});
