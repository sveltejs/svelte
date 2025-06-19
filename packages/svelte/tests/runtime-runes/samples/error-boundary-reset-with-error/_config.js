import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, warnings }) {
		const [toggle] = target.querySelectorAll('button');

		flushSync(() => toggle.click());
		assert.htmlEqual(
			target.innerHTML,
			// TODO the synthetic stack shouldn't be part of the message here
			`<button>toggle</button><p>yikes! in {expression} in undefined</p><button>reset</button>`
		);

		const [, reset] = target.querySelectorAll('button');
		flushSync(() => reset.click());
		assert.htmlEqual(
			target.innerHTML,
			`<button>toggle</button><p>yikes! in {expression} in undefined</p><button>reset</button>`
		);

		flushSync(() => toggle.click());

		const [, reset2] = target.querySelectorAll('button');
		flushSync(() => reset2.click());
		assert.htmlEqual(target.innerHTML, `<button>toggle</button><p>hello!</p>`);
	}
});
