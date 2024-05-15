import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>toggle outer</button>
		<button>toggle inner</button>
		<button>reset</button>
	`,

	test({ assert, target }) {
		const [outer, inner, reset] = target.querySelectorAll('button');

		flushSync(() => outer?.click());
		flushSync(() => inner?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle outer</button>
				<button>toggle inner</button>
				<button>reset</button>
				<p>v is true</p>
			`
		);

		flushSync(() => reset?.click());
		flushSync(() => inner?.click());
		flushSync(() => outer?.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>toggle outer</button>
				<button>toggle inner</button>
				<button>reset</button>
				<p>v is true</p>
			`
		);
	}
});
