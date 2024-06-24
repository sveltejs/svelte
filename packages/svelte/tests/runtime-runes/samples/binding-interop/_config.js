import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],
	async test({ assert, target }) {
		const buttons = target.querySelectorAll('button');

		for (const button of buttons) {
			await button.click();
			flushSync();
		}
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			bar <button>bar</button> bar <button>bar</button> bar <button>bar</button> bar <button>bar</button>
			<hr>
			bar <button>bar</button> bar <button>bar</button> foo <button>foo</button> foo <button>foo</button> bar <button>bar</button> bar <button>bar</button>
			`
		);
	}
});
