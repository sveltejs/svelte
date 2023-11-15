import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
	<button>click me</button>
	<button>click me</button>
	<button>click me</button>
	<button>click me</button>
	`,

	async test({ assert, target }) {
		const [b1, b2, b3, b4] = target.querySelectorAll('button');

		flushSync(() => {
			b1?.click();
		});
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>click spread</button>
			<button>click spread</button>
			<button>click spread</button>
			<button>click spread</button>
			`
		);

		flushSync(() => {
			b2?.click();
		});
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>click onclick</button>
			<button>click onclick</button>
			<button>click onclick</button>
			<button>click onclick</button>
			`
		);

		flushSync(() => {
			b3?.click();
		});
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>click spread</button>
			<button>click spread</button>
			<button>click spread!</button>
			<button>click spread!</button>
			`
		);

		flushSync(() => {
			b4?.click();
		});
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>click onclick</button>
			<button>click onclick</button>
			<button>click onclick?</button>
			<button>click onclick?</button>
			`
		);
	}
});
