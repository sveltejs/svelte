import { tick } from 'svelte';
import { test } from '../../test';

const buttons = `
	<button>start A: x = 1</button>
	<button>start B: show boundary</button>
	<button>resolve A</button>
	<button>resolve boundary</button>
	<button>reset</button>
`;

export default test({
	mode: ['client'],
	async test({ assert, target, logs }) {
		await tick();
		const [start_a, start_b, resolve_a, resolve_b, reset] = target.querySelectorAll('button');

		for (const boundary_first of [false, true]) {
			logs.length = 0;
			start_a.click();
			await tick();
			start_b.click();
			await tick();

			// B's pending boundary must transfer effects to A regardless of whether
			// it resolves before or after A renders.
			if (boundary_first) {
				resolve_b.click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<p>0</p>`);
				assert.deepEqual(logs, []);
				resolve_a.click();
			} else {
				resolve_a.click();
				await tick();
				assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><span>pending</span>`);
				resolve_b.click();
			}
			await tick();
			assert.htmlEqual(target.innerHTML, `${buttons}<p>1</p><strong>ready</strong>`);
			assert.deepEqual(logs, ['ready']);

			reset.click();
			await tick();
		}
	}
});
