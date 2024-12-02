import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
	<button>foo</button>
	<button>foo</button>
	<button>FOO</button>
	`,

	test({ assert, target }) {
		const [btn1, btn2, btn3] = target.querySelectorAll('button');

		// ensure each click runs in its own rerender task
		btn1.click();
		flushSync();

		btn2.click();
		flushSync();

		btn3.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
	<button>bar</button>
	<button>bar</button>
	<button>BAR</button>
	`
		);
	}
});
