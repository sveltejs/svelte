import { settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client', 'hydrate'],
	compileOptions: { experimental: { async: true } },
	async test({ assert, target, logs }) {
		await tick();
		await settled();
		const [button] = target.querySelectorAll('button');
		const [output] = target.querySelectorAll('output');
		const [paragraph] = output.querySelectorAll('p');
		assert.htmlEqual(output.innerHTML, '<p>2 1 4 1</p>');
		assert.deepEqual(logs, [
			'prefix',
			'begin',
			['snapshot', 1],
			['snapshot ready', 1],
			['continued', 2, 4]
		]);

		button.click();
		await settled();
		assert.htmlEqual(output.innerHTML, '<p>3 1 5 1</p>');
		assert.equal(output.querySelector('p'), paragraph);
		assert.deepEqual(logs, [
			'prefix',
			'begin',
			['snapshot', 1],
			['snapshot ready', 1],
			['continued', 2, 4]
		]);
	}
});
