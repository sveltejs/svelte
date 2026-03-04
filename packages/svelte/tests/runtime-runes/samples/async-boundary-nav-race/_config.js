import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>a</button>
		<button>b</button>
		<button>resolve a</button>
		<button>resolve b</button>
		<p>pending a</p>
	`,
	async test({ assert, target }) {
		const [a, b, resolve_a, resolve_b] = target.querySelectorAll('button');

		resolve_a.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>resolve a</button>
				<button>resolve b</button>
				<p>page a</p>
			`
		);

		b.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>resolve a</button>
				<button>resolve b</button>
				<p>pending b</p>
			`
		);

		a.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>resolve a</button>
				<button>resolve b</button>
				<p>pending a</p>
			`
		);

		resolve_b.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>resolve a</button>
				<button>resolve b</button>
				<p>pending a</p>
			`
		);

		resolve_a.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a</button>
				<button>b</button>
				<button>resolve a</button>
				<button>resolve b</button>
				<p>page a</p>
			`
		);

		await new Promise((r) => setTimeout(r, 100));
	}
});
