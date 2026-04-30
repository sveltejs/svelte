import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();
		const [increment, resolve] = target.querySelectorAll('button');
		logs.length = 0;

		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>increment</button> <button>resolve</button>
			<ul><li>0 / 0</li><li>0 / loading...</li><li>0 / 0</li></ul>`
		);

		resolve.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>increment</button> <button>resolve</button>
			<ul><li>0 / 0</li><li>1 / 1</li><li>0 / 0</li></ul>`
		);

		assert.equal(
			logs.some((l) => l.toString().includes('0 ') || l.toString().includes('2')),
			false,
			'only the second $state.eager should have been evaluated'
		);
	}
});
