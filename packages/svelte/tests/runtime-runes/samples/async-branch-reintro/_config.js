import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [inc_count, inc_both, shift] = target.querySelectorAll('button');

		inc_both.click();
		await tick();
		inc_count.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>increment count</button>
			<button>increment both</button>
			<button>shift</button>
			0
			0
			<button>0</button>
		`
		);

		shift.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment count</button>
				<button>increment both</button>
				<button>shift</button>
				1
				2
				<button>1</button>
			`
		);

		const button = /** @type {HTMLButtonElement} */ (target.querySelector('button:last-child'));
		button.click();
		await tick();
		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment count</button>
				<button>increment both</button>
				<button>shift</button>
				2
				2
				<button>2</button>
			`
		);
	}
});
