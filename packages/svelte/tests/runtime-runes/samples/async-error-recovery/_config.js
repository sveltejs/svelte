import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>increment</button>
		<p>pending...</p>
	`,

	compileOptions: {
		// this tests some behaviour that was broken in dev
		dev: true
	},

	async test({ assert, target }) {
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<p>0</p>
			`
		);

		let [button] = target.querySelectorAll('button');
		let [p] = target.querySelectorAll('p');

		flushSync(() => button.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		assert.equal(p.textContent, '1');

		flushSync(() => button.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		assert.equal(p.textContent, '2');

		flushSync(() => button.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>increment</button>
				<button>retry</button>
			`
		);

		const [button1, button2] = target.querySelectorAll('button');

		flushSync(() => button1.click());
		await Promise.resolve();

		flushSync(() => button2.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		[p] = target.querySelectorAll('p');

		assert.equal(p.textContent, '4');

		flushSync(() => button1.click());
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		assert.equal(p.textContent, '5');

		console.log(target.innerHTML);
	}
});
