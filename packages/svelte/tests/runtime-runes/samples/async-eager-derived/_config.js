import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [increment, shift] = target.querySelectorAll('button');

		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>clicks: 0 - 0 - 0</button> <button>shift</button> <p>true - true</p>`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`<button>clicks: 1 - 1 - 1</button> <button>shift</button> <p>false - false</p>`
		);
	}
});
