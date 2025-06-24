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

		for (let i = 1; i < 5; i += 1) {
			shift.click();
			await tick();

			assert.equal(p.innerHTML, `${i}: ${Math.min(i, 3)}`);
		}
	}
});
