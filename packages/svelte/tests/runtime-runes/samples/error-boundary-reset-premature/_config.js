import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		normal content
		<button>toggle</button>
	`,

	async test({ assert, target, warnings }) {
		const [btn] = target.querySelectorAll('button');

		flushSync(() => btn.click());
		assert.htmlEqual(target.innerHTML, `<div>err</div><button>toggle</button>`);
		assert.deepEqual(warnings, []);

		flushSync(() => btn.click());
		assert.htmlEqual(target.innerHTML, `normal content <button>toggle</button>`);
		assert.deepEqual(warnings, []);

		flushSync(() => btn.click());
		assert.htmlEqual(target.innerHTML, `<div>err</div><button>toggle</button>`);

		assert.deepEqual(warnings, [
			'A `<svelte:boundary>` `reset` function only resets the boundary the first time it is called'
		]);
	}
});
