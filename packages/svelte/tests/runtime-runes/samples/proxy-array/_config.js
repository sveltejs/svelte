import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>1 + 2 + 3 = 6</button>
		<button>clear</button>
		<button>reverse</button>
		<span>1</span>
		<span>2</span>
		<span>3</span>
		<strong>array[1]: 2</strong>
	`,

	async test({ assert, target }) {
		const [add, clear, reverse] = target.querySelectorAll('button');

		await add?.click();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1 + 2 + 3 + 4 = 10</button>
				<button>clear</button>
				<button>reverse</button>
				<span>1</span>
				<span>2</span>
				<span>3</span>
				<span>4</span>
				<strong>array[1]: 2</strong>
			`
		);

		flushSync(() => {
			reverse?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>4 + 3 + 2 + 1 = 10</button>
				<button>clear</button>
				<button>reverse</button>
				<span>4</span>
				<span>3</span>
				<span>2</span>
				<span>1</span>
				<strong>array[1]: 3</strong>
			`
		);

		flushSync(() => {
			clear?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>4 = 4</button>
				<button>clear</button>
				<button>reverse</button>
				<span>4</span>
				<strong>array[1]:</strong>
			`
		);
	}
});
