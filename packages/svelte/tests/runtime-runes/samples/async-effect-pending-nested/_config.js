import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [increment, shift] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>loading...</p>
			`
		);

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
				<p>inner pending: 0</p>
				<p>outer pending: 0</p>
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
				<p>inner pending: 3</p>
				<p>outer pending: 0</p>
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
				<p>inner pending: 2</p>
				<p>outer pending: 0</p>
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
				<p>inner pending: 1</p>
				<p>outer pending: 0</p>
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
				<p>inner pending: 0</p>
				<p>outer pending: 0</p>
			`
		);
	}
});
