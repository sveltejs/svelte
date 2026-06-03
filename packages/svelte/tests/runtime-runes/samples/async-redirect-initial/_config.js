import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		const [a, b, c, ok] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			`
				<h1>b</h1>
				<button>a</button>
				<button>b</button>
				<button>c</button>
				<button>ok</button>
				<p>pending...</p>
			`
		);

		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<h1>c</h1>
				<button>a</button>
				<button>b</button>
				<button>c</button>
				<button>ok</button>
				<p>c</p>
			`
		);

		ok.click();

		b.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<h1>b</h1>
				<button>a</button>
				<button>b</button>
				<button>c</button>
				<button>ok</button>
				<p>b</p>
			`
		);
	}
});
