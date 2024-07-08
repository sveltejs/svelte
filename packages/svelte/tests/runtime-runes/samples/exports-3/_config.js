import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`0 0 <button>0 / 0</button> <button>assign directly</button>`
		);
		const [btn1, btn2] = target.querySelectorAll('button');

		btn1.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'1 2 <button>1 / 2</button> <button>assign directly</button>'
		);

		btn2.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			'2 4 <button>2 / 4</button> <button>assign directly</button>'
		);
	}
});
