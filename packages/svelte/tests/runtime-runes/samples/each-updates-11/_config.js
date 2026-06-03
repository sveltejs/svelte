import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [add4, add5, modify3] = target.querySelectorAll('button');

		add4.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>add 4</button> <button>add 5</button> <button>modify 3</button>
			1423`
		);

		add5.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>add 4</button> <button>add 5</button> <button>modify 3</button>
			14523`
		);

		modify3.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`<button>add 4</button> <button>add 5</button> <button>modify 3</button>
			1452updated`
		);
	}
});
