import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, warnings }) {
		const [btn1, btn2, btn3, btn4, btn5, btn6, clear] = target.querySelectorAll('button');

		flushSync(() => {
			btn1.click();
			btn2.click();
			btn3.click();
			btn4.click();
			btn5.click();
			btn6.click();
		});

		assert.deepEqual(warnings, [
			'Reactive `$state(...)` proxies and the values they proxy have different identities. Because of this, comparisons with `array.includes(...)` will produce unexpected results',
			'Reactive `$state(...)` proxies and the values they proxy have different identities. Because of this, comparisons with `array.indexOf(...)` will produce unexpected results',
			'Reactive `$state(...)` proxies and the values they proxy have different identities. Because of this, comparisons with `array.lastIndexOf(...)` will produce unexpected results'
		]);

		flushSync(() => clear.click());
		warnings.length = 0;

		flushSync(() => {
			btn1.click();
			btn2.click();
			btn3.click();
			btn4.click();
			btn5.click();
			btn6.click();
		});

		assert.deepEqual(warnings, []);
	}
});
