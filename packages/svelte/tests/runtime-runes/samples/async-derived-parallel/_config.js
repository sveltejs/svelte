import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		const [a, b, c, d, config, e] = target.querySelectorAll('button');

		await tick();
		assert.deepEqual(logs.splice(0), ['load a', 'load b', 'load d']);

		// `b` and `d` resolving first doesn't let the script continue, it still waits for `a`
		b.click();
		d.click();
		await tick();
		assert.deepEqual(logs.splice(0), []);
		assert.equal(target.querySelectorAll('output').length, 0);

		a.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load c']);

		c.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load config']);

		config.click();
		await tick();
		assert.deepEqual(logs.splice(0), ['load e']);
		assert.equal(target.querySelectorAll('output').length, 0);

		e.click();
		await tick();

		const [output] = target.querySelectorAll('output');
		assert.htmlEqual(output.innerHTML, 'a b c C config d e');
		assert.deepEqual(logs, []);
	}
});
