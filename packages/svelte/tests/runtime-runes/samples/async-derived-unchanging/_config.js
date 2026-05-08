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

		for (let i = 0; i < 4; i += 1) {
			flushSync(() => increment.click());
		}

		const seen = [];
		for (let i = 0; i < 4; i += 1) {
			shift.click();
			await tick();

			seen.push(p.innerHTML);
		}

		assert.deepEqual(seen, ['0: 0', '0: 0', '0: 0', '4: 3']);
	}
});
