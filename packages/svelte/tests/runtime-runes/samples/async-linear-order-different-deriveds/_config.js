import { flushSync, settled, tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<button>both</button><button>a</button><button>b</button><p>loading...</p>`,

	async test({ assert, target }) {
		const [both, a, b] = target.querySelectorAll('button');

		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>both</button><button>a</button><button>b</button>
				<p>1 * 2 = 2</p>
				<p>2 * 2 = 4</p>
			`
		);

		flushSync(() => both.click());
		flushSync(() => b.click());

		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>both</button><button>a</button><button>b</button>
				<p>2 * 2 = 4</p>
				<p>4 * 2 = 8</p>
			`
		);
	}
});
