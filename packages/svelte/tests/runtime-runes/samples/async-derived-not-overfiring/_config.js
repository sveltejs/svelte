import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true, // TODO fix
	async test({ assert, target, logs }) {
		await tick();

		const [a, b, log, resolve] = target.querySelectorAll('button');
		const [div] = target.querySelectorAll('div');

		assert.deepEqual(logs, ['e1 0', 'e2 0']);
		logs.length = 0;

		a.click();
		await tick();
		assert.htmlEqual(div.innerHTML, '<p>0</p> <p>0</p> <p>0</p>');

		b.click();
		await tick();
		assert.htmlEqual(div.innerHTML, '<p>0</p> <p>1</p> <p>1</p>');

		log.click();
		await tick();
		assert.deepEqual(logs, ['e1 1', 'e2 1', 'runs 2']); // ideally it's only 2 runs, one or two more would also be acceptable but not the 8 that it's today
		logs.length = 0;

		resolve.click();
		await tick();
		log.click();
		await tick();
		assert.htmlEqual(div.innerHTML, '<p>1</p> <p>2</p> <p>2</p>');
		assert.deepEqual(logs, ['e1 2', 'e2 2', 'runs 3']);
	}
});
