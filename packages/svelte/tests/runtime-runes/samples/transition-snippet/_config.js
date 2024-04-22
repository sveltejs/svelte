import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	test({ assert, target, raf }) {
		const button = target.querySelector('button');
		ok(button);

		flushSync(() => button.click());
		raf.tick(50);
		assert.htmlEqual(target.innerHTML, '<button>toggle</button><p style="opacity: 0.5;">hello</p>');

		flushSync(() => button.click());
		raf.tick(75);
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle</button><p style="opacity: 0.25;">hello</p>'
		);
	}
});
