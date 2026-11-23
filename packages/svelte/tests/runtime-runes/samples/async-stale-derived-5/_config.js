import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [increment, shift] = target.querySelectorAll('button');

		increment.click();
		await tick();
		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>3</button><button>shift</button><p>1 = 1</p><p>fizz: true</p><p>buzz: true</p>`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>3</button><button>shift</button><p>1 = 1</p><p>fizz: true</p><p>buzz: true</p>`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>3</button><button>shift</button><p>3 = 3</p><p>fizz: true</p><p>buzz: false</p>`
		);
	}
});
