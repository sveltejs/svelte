import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, raf }) {
		const [clear, reverse] = target.querySelectorAll('button');

		flushSync(() => clear.click());
		flushSync(() => reverse.click());
		raf.tick(1);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>clear</button>
				<button>reverse</button>
				<span style="opacity: 1;">c</span>
				<span style="opacity: 1;">b</span>
				<span style="opacity: 1;">a</span>
			`
		);
	}
});
