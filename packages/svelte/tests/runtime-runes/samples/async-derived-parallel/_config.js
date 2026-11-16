import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, c, d] = target.querySelectorAll('button');

		await tick();
		assert.deepEqual(logs.splice(0), ['load a', 'load b']);

		// `b` resolving first doesn't let the script continue, it still waits for `a`
		b.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);
		assert.equal(target.querySelectorAll('output').length, 0);

		a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load c', 'load d']);
		assert.equal(target.querySelectorAll('output').length, 0);

		d.click();
		await tick();
		assert.equal(target.querySelectorAll('output').length, 0);

		c.click();
		await tick();

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'a b c d');
		assert.deepEqual(logs, []);
	}
});
