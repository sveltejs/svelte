import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>0</button>
		<p>doubled: 0</p>
	`,

	test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1</button>
				<p>doubled: 2</p>
			`
		);

		btn?.click();
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
				<button>2</button>
				<p>doubled: 4</p>
			`
		);
	}
});
