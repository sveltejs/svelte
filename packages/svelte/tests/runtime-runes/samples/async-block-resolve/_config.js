import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [increment, shift] = target.querySelectorAll('button');

		shift.click();
		await tick();

		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>0</button>
				<button>shift</button>
				<p>even</p>
				<p>0</p>
			`
		);

		increment.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1</button>
				<button>shift</button>
				<p>even</p>
				<p>0</p>
			`
		);

		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1</button>
				<button>shift</button>
				<p>odd</p>
				<p>loading...</p>
			`
		);

		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1</button>
				<button>shift</button>
				<p>odd</p>
				<p>1</p>
			`
		);
	}
});
