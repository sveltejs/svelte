import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: { dev: true },
	async test({ assert, target }) {
		await new Promise((resolve) => setTimeout(resolve, 0));
		assert.htmlEqual(
			target.innerHTML,
			'<button>count</button><button>suffix</button><p>1</p><p title="1">a</p>'
		);

		const [count, suffix] = target.querySelectorAll('button');
		count.click();
		await new Promise((resolve) => setTimeout(resolve, 0));
		assert.htmlEqual(
			target.innerHTML,
			'<button>count</button><button>suffix</button><p>2</p><p title="2">a</p>'
		);

		suffix.click();
		await tick();
		assert.htmlEqual(
			target.innerHTML,
			'<button>count</button><button>suffix</button><p>2</p><p title="2">b</p>'
		);
	}
});
