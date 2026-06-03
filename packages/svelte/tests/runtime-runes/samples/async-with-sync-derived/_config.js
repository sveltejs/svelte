import { flushSync, tick } from 'svelte';
import { test } from '../../test';

export default test({
	html: `<p>loading...</p>`,

	async test({ assert, target }) {
		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>log</button>
				<button>x 1</button>
				<button>other 1</button>
				<p>1</p>
				<p>1</p>
				<p>1</p>
			`
		);

		const [log, x, other] = target.querySelectorAll('button');

		flushSync(() => x.click());
		flushSync(() => other.click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>log</button>
				<button>x 1</button>
				<button>other 2</button>
				<p>1</p>
				<p>1</p>
				<p>1</p>
			`
		);

		await tick();

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>log</button>
				<button>x 2</button>
				<button>other 2</button>
				<p>2</p>
				<p>2</p>
				<p>2</p>
			`
		);
	}
});
