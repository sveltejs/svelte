import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>increment</button>
		<button>shift</button>
		<p>0</p>
	`,

	async test({ assert, target }) {
		const [increment, shift] = target.querySelectorAll('button');

		increment.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>1</p>
			`
		);

		shift.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>shift</button>
				<p>resolved</p>
			`
		);
	}
});
