import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, instance, target, logs }) {
		const a = instance.show();
		await tick();
		const b = instance.update();
		await tick();
		const c = instance.update();
		await tick();

		instance.resolve('value', 3);
		await tick();
		assert.deepEqual(logs.splice(0), ['continued value with 3 3']);
		instance.resolve('other', 3);
		await tick();
		assert.deepEqual(logs.splice(0), ['continued other with 3 3']);
		assert.equal(target.querySelector('p'), null);

		instance.resolve('gate', 3);
		await Promise.all([a, b, c]);
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<p>value: 3 3</p><p>other: 3 3</p><span>3</span><output>0</output>'
		);

		for (const [label, n] of [
			['value', 1],
			['value', 2],
			['other', 2],
			['gate', 2]
		]) {
			instance.resolve(label, n);
		}
		await tick();
		assert.deepEqual(logs, []);
		assert.htmlEqual(
			target.innerHTML,
			'<p>value: 3 3</p><p>other: 3 3</p><span>3</span><output>0</output>'
		);
	}
});
