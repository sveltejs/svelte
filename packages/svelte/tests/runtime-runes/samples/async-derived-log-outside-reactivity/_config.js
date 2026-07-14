import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true, // TODO fix
	async test({ assert, target, logs }) {
		await tick();

		const [a, b, log, resolve] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		a.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0 0 0');

		b.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0 0 0');

		log.click();
		await tick();
		assert.deepEqual(logs, [0, 2]);

		resolve.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '1 0 1');
		assert.deepEqual(logs, [0, 2, 1]);

		log.click();
		await tick();
		assert.deepEqual(logs, [0, 2, 1, 2]);

		resolve.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '1 1 2');
		assert.deepEqual(logs, [0, 2, 1, 2, 2]);

		log.click();
		await tick();
		assert.deepEqual(logs, [0, 2, 1, 2, 2, 2]);
	}
});
