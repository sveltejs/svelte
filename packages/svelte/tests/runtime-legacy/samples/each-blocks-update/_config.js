import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>1</button>
		<button>2</button>
		<button>3</button>
		<p>1, 2, 3</p>
	`,

	test({ assert, target }) {
		let buttons = target.querySelectorAll('button');

		flushSync(() => buttons[2].click());

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>1</button>
				<button>2</button>
				<button>4</button>
				<p>1, 2, 4</p>
			`
		);
	}
});
