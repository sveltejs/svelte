import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<p>pending...</p>`,

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>increment</button>
				<p>0: 0</p>
			`
		);

		const [shift, increment] = target.querySelectorAll('button');
		const [p] = target.querySelectorAll('p');

		for (let i = 1; i < 5; i += 1) {
			flushSync(() => increment.click());
		}

		// all four updates write `count` and therefore share the async work —
		// they are merged into a single batch, in which the first three
		// in-flight runs are superseded. Only resolving the final run commits
		for (let i = 1; i < 5; i += 1) {
			shift.click();
			await tick();

			assert.equal(p.innerHTML, i < 4 ? '0: 0' : '4: 3');
		}
	}
});
