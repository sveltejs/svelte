import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>switch to d2</button>
		<button>resolve d1</button>
		<button>resolve d2</button>
		<p>pending</p>
	`,

	async test({ assert, target, component, errors, variant }) {
		if (variant === 'hydrate') {
			await Promise.resolve();
		}

		const [toggle, resolve1, resolve2] = target.querySelectorAll('button');

		flushSync(() => toggle.click());

		flushSync(() => resolve1.click());
		await Promise.resolve();
		await Promise.resolve();

		flushSync(() => resolve2.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>switch to d2</button>
				<button>resolve d1</button>
				<button>resolve d2</button>
				<p>two</p>
			`
		);

		assert.deepEqual(errors, []);
	}
});
