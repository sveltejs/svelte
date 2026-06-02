import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, logs }) {
		await tick();

		const [increment, shift] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<div>1</div>
				<div>2</div>
				<div>3</div>
			`
		);

		assert.deepEqual(logs, ['updating']);

		increment.click();
		await tick();
		increment.click();
		await tick();

		assert.deepEqual(logs, ['updating', 'updating', 'updating']);

		shift.click();
		shift.click();
		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<div>2</div>
				<div>3</div>
				<div>4</div>
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
				<div>3</div>
				<div>4</div>
				<div>5</div>
			`
		);
	}
});
