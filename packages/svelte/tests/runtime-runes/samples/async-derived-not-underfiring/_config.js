import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true, // TODO fix
	async test({ assert, target, logs }) {
		await tick();

		const [a, b, resolve] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		assert.deepEqual(logs, ['b: 0, d: 0']);
		logs.length = 0;

		a.click();
		await tick();
		b.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '0 1');
		assert.deepEqual(logs, ['b: 1, d: 0']);
		logs.length = 0;

		resolve.click();
		await tick();
		assert.htmlEqual(p.innerHTML, '2 1');
		assert.deepEqual(logs, ['b: 1, d: 2']);
	}
});
