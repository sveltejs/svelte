import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const [update, first, second] = target.querySelectorAll('button');
		const values = () => [...target.querySelectorAll('output')].map((node) => node.innerHTML);

		assert.deepEqual(values(), ['0 0', '0']);
		assert.deepEqual(logs.splice(0), ['start']);
		update.click();
		await tick();
		assert.deepEqual(values(), ['1 1', '1']);
		assert.deepEqual(logs.splice(0), []);

		first.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);
		update.click();
		await tick();
		assert.deepEqual(values(), ['2']);
		assert.deepEqual(logs.splice(0), []);

		second.click();
		await tick();
		assert.deepEqual(values(), []);
		assert.deepEqual(logs.splice(0), ['stop']);

		update.click();
		first.click();
		await tick();
		assert.deepEqual(values(), ['3 3']);
		assert.deepEqual(logs.splice(0), ['start']);
		first.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['stop']);
	}
});
