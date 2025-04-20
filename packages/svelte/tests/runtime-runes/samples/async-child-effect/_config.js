import { flushSync, tick } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>shift</button>
		<p>loading</p>
	`,

	async test({ assert, target, variant }) {
		if (variant === 'hydrate') {
			await Promise.resolve();
		}

		flushSync(() => {
			target.querySelector('button')?.click();
		});

		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();

		const [button1, button2] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>+</button>
				<p>A</p>
				<p>a</p>
			`
		);

		flushSync(() => button2.click());
		flushSync(() => button2.click());

		flushSync(() => button1.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>+</button>
				<p>AA</p>
				<p>aa</p>
			`
		);

		flushSync(() => button1.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await tick();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>+</button>
				<p>AAA</p>
				<p>aaa</p>
			`
		);
	}
});
