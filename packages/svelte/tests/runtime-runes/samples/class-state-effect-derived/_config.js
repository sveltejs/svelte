import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>10</button>`,

	test({ assert, target, logs }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>11</button>`);

		btn?.click();
		flushSync();
		assert.htmlEqual(target.innerHTML, `<button>12</button>`);

		assert.deepEqual(logs, [0, 10, 11, 12]);
	}
});
