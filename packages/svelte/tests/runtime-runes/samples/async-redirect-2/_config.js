import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, logs, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
				<h1>a</h1>
				<button>a</button>
				<button>b</button>
				<button>c</button>
				<p>a</p>
			`
		);

		const [a, b] = target.querySelectorAll('button');

		b.click();
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<h1>c</h1>
				<button>a</button>
				<button>b</button>
				<button>c</button>
				<p>c</p>
				<p>b or c</p>
			`
		);

		assert.deepEqual(logs, ['route a', 'route c']);
	}
});
