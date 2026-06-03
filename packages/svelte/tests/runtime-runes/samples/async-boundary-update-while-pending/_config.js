import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		await tick();
		const [shift, increment] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				loading
			`
		);

		increment.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				loading
			`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				loading
			`
		);

		shift.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				1
			`
		);
	}
});
