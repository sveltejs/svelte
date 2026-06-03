import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target, raf }) {
		const [clear, push] = target.querySelectorAll('button');

		flushSync(() => clear.click());
		flushSync(() => push.click());
		raf.tick(500);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>clear</button>
				<button>push</button>
				<span style="opacity: 1;">1</span>
				<span style="opacity: 0.5;">2</span>
			`
		);

		raf.tick(1000);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>clear</button>
				<button>push</button>
				<span style="opacity: 1;">1</span>
			`
		);
	}
});
