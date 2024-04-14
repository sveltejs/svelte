import { test } from '../../test';
import { flushSync } from 'svelte';
import { log } from './log';

export default test({
	compileOptions: {
		dev: true
	},
	before_test() {
		log.length = 0;
	},
	async test({ assert, target }) {
		const [in1, in2] = target.querySelectorAll('input');
		const [b1, b2, b3] = target.querySelectorAll('button');

		assert.deepEqual(log, [
			{ label: 'map', type: 'init', values: [] },
			{ label: 'set', type: 'init', values: [] },
			{ label: 'date', type: 'init', values: 1712966400000 }
		]);
		log.length = 0;

		b1.click(); // map.set('key', 'value')

		in1.value = 'name';
		in2.value = 'Svelte';
		in1.dispatchEvent(new window.Event('input', { bubbles: true }));
		in2.dispatchEvent(new window.Event('input', { bubbles: true }));
		flushSync(() => b1.click()); // map.set('name', 'Svelte')

		in2.value = 'World';
		in2.dispatchEvent(new window.Event('input', { bubbles: true }));
		flushSync(() => b1.click()); // map.set('name', 'World')
		flushSync(() => b1.click()); // map.set('name', 'World')

		assert.deepEqual(log, [
			{ label: 'map', type: 'update', values: [['key', 'value']] },
			{
				label: 'map',
				type: 'update',
				values: [
					['key', 'value'],
					['name', 'Svelte']
				]
			},
			{
				label: 'map',
				type: 'update',
				values: [
					['key', 'value'],
					['name', 'World']
				]
			}
		]);
		log.length = 0;

		b2.click(); // set.add('name');

		in1.value = 'Svelte';
		in1.dispatchEvent(new window.Event('input', { bubbles: true }));
		b2.click(); // set.add('Svelte');

		b2.click(); // set.add('Svelte');

		assert.deepEqual(log, [
			{ label: 'set', type: 'update', values: ['name'] },
			{ label: 'set', type: 'update', values: ['name', 'Svelte'] }
		]);
		log.length = 0;

		b3.click(); // date.minutes++
		b3.click(); // date.minutes++
		b3.click(); // date.minutes++

		assert.deepEqual(log, [
			{ label: 'date', type: 'update', values: 1712966460000 },
			{ label: 'date', type: 'update', values: 1712966520000 },
			{ label: 'date', type: 'update', values: 1712966580000 }
		]);
	}
});
