import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>mutate: 0</button>
		<button>reassign: 0</button>
		<button>mutate: 0</button>
		<button>reassign: 0</button>
	`,

	async test({ assert, target }) {
		const [btn1, btn2, btn3, btn4] = target.querySelectorAll('button');

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>mutate: 1</button>
				<button>reassign: 1</button>
				<button>mutate: 0</button>
				<button>reassign: 0</button>
			`
		);

		flushSync(() => {
			btn2?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>mutate: 2</button>
				<button>reassign: 2</button>
				<button>mutate: 0</button>
				<button>reassign: 0</button>
			`
		);

		flushSync(() => {
			btn1?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>mutate: 3</button>
				<button>reassign: 3</button>
				<button>mutate: 0</button>
				<button>reassign: 0</button>
			`
		);

		flushSync(() => {
			btn3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>mutate: 3</button>
				<button>reassign: 3</button>
				<button>mutate: 1</button>
				<button>reassign: 1</button>
			`
		);

		flushSync(() => {
			btn4?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>mutate: 3</button>
				<button>reassign: 3</button>
				<button>mutate: 2</button>
				<button>reassign: 2</button>
			`
		);

		flushSync(() => {
			btn3?.click();
		});

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>mutate: 3</button>
				<button>reassign: 3</button>
				<button>mutate: 3</button>
				<button>reassign: 3</button>
			`
		);
	}
});
