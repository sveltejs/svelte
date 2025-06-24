import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>shift</button>
		<p>loading</p>
	`,

	async test({ assert, target }) {
		target.querySelector('button')?.click();
		await tick();

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

		button1.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>shift</button>
				<button>+</button>
				<p>AA</p>
				<p>aa</p>
			`
		);

		button1.click();
		await tick();

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
