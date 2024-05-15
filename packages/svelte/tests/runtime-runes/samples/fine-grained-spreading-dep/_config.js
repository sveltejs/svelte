import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>reset</button>
		<button>add foo</button>
		<button>update foo</button>
		<button>update bar</button>
		<button>update rest</button>
		<button>update x</button>
	`,
	async test({ assert, target, logs }) {
		const [reset, add_foo, update_foo, update_bar, update_rest, update_x] =
			target.querySelectorAll('button');

		assert.deepEqual(logs, ['something']);

		flushSync(() => reset.click());
		assert.deepEqual(logs, ['something']);

		flushSync(() => add_foo.click());
		assert.deepEqual(logs, ['something', 'something']);

		flushSync(() => update_foo.click());
		assert.deepEqual(logs, ['something', 'something']);

		flushSync(() => update_bar.click());
		assert.deepEqual(logs, ['something', 'something', 'something']);

		flushSync(() => update_rest.click());
		assert.deepEqual(logs, ['something', 'something', 'something', 'else']);

		flushSync(() => update_x.click());
		assert.deepEqual(logs, ['something', 'something', 'something', 'else', 'another']);
	}
});
