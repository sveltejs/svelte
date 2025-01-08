import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		let btn = target.querySelector('button');

		btn?.click();
		btn?.click();
		flushSync();

		assert.deepEqual(logs, ['error caught']);
		assert.htmlEqual(target.innerHTML, `<div>too high</div><button>Retry</button>`);

		const [btn2] = target.querySelectorAll('button');

		btn2?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, `0\n<button>+</button>`);

		btn = target.querySelector('button');

		btn?.click();
		btn?.click();
		flushSync();

		assert.deepEqual(logs, ['error caught', 'error caught']);
		assert.htmlEqual(target.innerHTML, `<div>too high</div><button>Retry</button>`);
	}
});
