import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		const buttons = target.querySelectorAll('button');
		const values = target.querySelectorAll('div > span:first-child');
		const second = values[1];

		assert.deepEqual(logs.splice(0), ['setup a', 'setup b']);

		for (let value = 1; value <= 3; value += 1) {
			buttons[1].click();
			await tick();
			assert.equal(values[0].textContent, `a: ${value}`);
			assert.equal(second.textContent, 'b: 0');
		}

		assert.deepEqual(logs.splice(0), [
			'cleanup a',
			'setup a',
			'cleanup a',
			'setup a',
			'cleanup a',
			'setup a'
		]);

		buttons[3].click();
		await tick();
		assert.equal(second.textContent, 'b: 1');
		assert.deepEqual(logs.splice(0), ['cleanup b', 'setup b']);

		buttons[4].click();
		await tick();
		assert.equal(target.querySelector('div > span:first-child'), second);
		assert.deepEqual(logs.splice(0), ['cleanup a']);

		buttons[3].click();
		await tick();
		assert.equal(second.textContent, 'b: 2');
		assert.deepEqual(logs.splice(0), ['cleanup b', 'setup b']);

		buttons[4].click();
		await tick();
		assert.equal(target.querySelector('div'), null);
		assert.deepEqual(logs.splice(0), ['cleanup b']);
	}
});
