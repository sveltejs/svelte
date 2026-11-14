import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	intro: false,
	transformError: () => 'nope',
	test({ assert, target, raf }) {
		const button = target.querySelector('button');
		ok(button);
		const divs = [...target.querySelectorAll('div')];
		assert.equal(divs.length, 3);
		raf.tick(100);

		flushSync(() => button.click());
		assert.equal(target.querySelectorAll('div').length, 3);
		raf.tick(150);
		for (const div of divs) assert.equal(div.style.opacity, '0.5');

		// Reversing the outro must resume the same boundary instances.
		flushSync(() => button.click());
		raf.tick(200);
		assert.deepEqual([...target.querySelectorAll('div')], divs);
		for (const div of divs) assert.equal(div.style.opacity, '');

		flushSync(() => button.click());
		raf.tick(300);
		assert.htmlEqual(target.innerHTML, '<button>toggle</button>');
	}
});
