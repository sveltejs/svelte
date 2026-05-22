import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();

		const [increment, shift, pop] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1</button>
				<button>shift</button>
				<button>pop</button>
				<p>1 = 1</p>
			`
		);

		increment.click();
		await tick();
		increment.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>3</button>
				<button>shift</button>
				<button>pop</button>
				<p>1 = 1</p>
			`
		);

		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>3</button>
				<button>shift</button>
				<button>pop</button>
				<p>1 = 1</p>
			`
		);

		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>3</button>
				<button>shift</button>
				<button>pop</button>
				<p>3 = 3</p>
			`
		);

		increment.click();
		await tick();
		increment.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>5</button>
				<button>shift</button>
				<button>pop</button>
				<p>3 = 3</p>
			`
		);

		pop.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>5</button>
				<button>shift</button>
				<button>pop</button>
				<p>5 = 5</p>
			`
		);
	}
});
