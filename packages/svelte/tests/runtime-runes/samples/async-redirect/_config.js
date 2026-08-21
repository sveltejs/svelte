import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
				<h1>a</h1>
				<button>a</button>
				<button>b</button>
				<button>c</button>
				<button>ok</button>
				<p>a</p>
			`
		);

		const [a, b, c, ok] = target.querySelectorAll('button');

		b.click();
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
				<p>b or c</p>
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
				<p>b or c</p>
			`
		);
	}
});
