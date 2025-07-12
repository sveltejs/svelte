import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [increment, shift] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>0</p>
			`
		);

		increment.click();
		await tick();

		increment.click();
		await tick();

		increment.click();
		await tick();

		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>2</p>
			`
		);

		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>delayed: 3</p>
			`
		);
	}
});
