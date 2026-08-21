import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip_no_async: true,
	async test({ assert, target }) {
		const [fork, toggle, increment] = target.querySelectorAll('button');

		// derived is first evaluated in block effect, then discarded
		flushSync(() => fork.click());

		// should not throw "Cannot convert a Symbol value to a string" due to cached UNINITIALIZED from first fork
		flushSync(() => fork.click());

		// should not reflect the temporary change to `clicks` inside the fork
		flushSync(() => toggle.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>fork</button>
				<button>toggle</button>
				<button>clicks: 0</button>
				<p>0</p>
			`
		);

		flushSync(() => increment.click());

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
