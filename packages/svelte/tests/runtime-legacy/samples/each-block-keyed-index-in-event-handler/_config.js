import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>remove</button>
		<button>remove</button>
		<button>remove</button>
	`,

	test({ assert, target, window }) {
		const click = new window.MouseEvent('click', { bubbles: true });

		target.querySelectorAll('button')[1].dispatchEvent(click);
		target.querySelectorAll('button')[1].dispatchEvent(click);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>remove</button>
		`
		);
	}
});
