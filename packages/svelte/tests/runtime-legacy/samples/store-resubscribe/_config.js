import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<h1>0</h1>
		<button>+1</button>
		<button>reset</button>
	`,

	test({ assert, target, window }) {
		const buttons = target.querySelectorAll('button');
		const click = new window.MouseEvent('click', { bubbles: true });

		buttons[0].dispatchEvent(click);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>1</h1>
			<button>+1</button>
			<button>reset</button>
		`
		);

		buttons[1].dispatchEvent(click);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>0</h1>
			<button>+1</button>
			<button>reset</button>
		`
		);

		buttons[0].dispatchEvent(click);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<h1>1</h1>
			<button>+1</button>
			<button>reset</button>
		`
		);
	}
});
