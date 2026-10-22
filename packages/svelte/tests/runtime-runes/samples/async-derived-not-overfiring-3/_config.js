import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();

		const [a, b, resolve, log] = target.querySelectorAll('button');
		const [, p] = target.querySelectorAll('p');

		log.click();
		await tick();
		assert.deepEqual(logs, ['parent 1, child 1']);
		logs.length = 0;

		// change `b` while `a++` is pending
		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '1 1');
		log.click();
		await tick();
		assert.deepEqual(logs, ['parent 0, child 1']);
		logs.length = 0;

		resolve.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '5 5');
		log.click();
		await tick();
		assert.deepEqual(logs, ['parent 1, child 1']);
		logs.length = 0;

		// two pending changes, the first one resolves
		a.click();
		await tick();
		a.click();
		await tick();
		resolve.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '9 9');
		log.click();
		await tick();
		assert.deepEqual(logs, ['parent 1, child 1']);
	}
});
