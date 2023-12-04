import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>1 + 2 + 3 = 6</button>
		<button>delete 2</button>
		<button>clear</button>
		<span>1</span>
		<span>2</span>
		<span>3</span>
		<strong>set.has(2): true</strong>
	`,

	async test({ assert, target }) {
		const [add, delete2, clear] = target.querySelectorAll('button');

		flushSync(() => add?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1 + 2 + 3 + 4 = 10</button>
				<button>delete 2</button>
				<button>clear</button>
				<span>1</span>
				<span>2</span>
				<span>3</span>
				<span>4</span>
				<strong>set.has(2): true</strong>
			`
		);

		flushSync(() => delete2?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1 + 3 + 4 = 8</button>
				<button>delete 2</button>
				<button>clear</button>
				<span>1</span>
				<span>3</span>
				<span>4</span>
				<strong>set.has(2): false</strong>
			`
		);

		flushSync(() => clear?.click());
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1 = 1</button>
				<button>delete 2</button>
				<button>clear</button>
				<span>1</span>
				<strong>set.has(2): false</strong>
			`
		);
	}
});
