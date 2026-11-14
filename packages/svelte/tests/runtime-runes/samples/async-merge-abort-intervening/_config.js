import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, instance, target, logs }) {
		const a = instance.first();
		await tick();
		const b = instance.middle();
		await tick();
		const c = instance.last();
		await tick();
		instance.resolve('value', 2);
		await tick();
		assert.deepEqual(logs.splice(0), ['continued with 2 2']);
		instance.resolve('gate', 2);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>2 2</p><span>2</span><output>0</output>');
		await Promise.all([a, b, c]);
		instance.resolve('gate', 1);
		instance.resolve('value', 1);
		await tick();
		assert.htmlEqual(target.innerHTML, '<p>2 2</p><span>2</span><output>0</output>');
		assert.deepEqual(logs, []);
	}
});
