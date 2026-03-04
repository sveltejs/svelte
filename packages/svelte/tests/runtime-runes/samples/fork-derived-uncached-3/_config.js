import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	async test({ assert, target }) {
		const [fork, toggle, increment] = target.querySelectorAll('button');

		// initialize derived by showing it
		flushSync(() => toggle.click());
		flushSync(() => toggle.click());

		// increment clicks
		flushSync(() => increment.click());

		// update derived, but without writing to `derived.v`
		flushSync(() => fork.click());

		// show derived
		flushSync(() => toggle.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>fork</button>
				<button>toggle</button>
				<button>clicks: 1</button>
				<p>2</p>
			`
		);
	}
});
