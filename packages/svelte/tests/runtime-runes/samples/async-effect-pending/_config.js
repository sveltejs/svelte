import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [increment, shift] = target.querySelectorAll('button');

		shift.click();
		shift.click();
		shift.click();

		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>0</p>
				<p>0</p>
				<p>0</p>
				<p>pending: 0</p>
			`
		);

		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>0</p>
				<p>0</p>
				<p>0</p>
				<p>pending: 3</p>
			`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>0</p>
				<p>0</p>
				<p>0</p>
				<p>pending: 2</p>
			`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>0</p>
				<p>0</p>
				<p>0</p>
				<p>pending: 1</p>
			`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>1</p>
				<p>1</p>
				<p>1</p>
				<p>pending: 0</p>
			`
		);
	}
});
