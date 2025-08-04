import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [increment, shift] = target.querySelectorAll('button');

		increment.click();
		await tick();

		shift.click();
		await tick();

		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>false</p>
				<p>1</p>
			`
		);
	}
});
