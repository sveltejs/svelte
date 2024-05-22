import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: `
		<button>0</button>
		<button>0</button>
	`,

	async test({ assert, component, target, window }) {
		const buttons = target.querySelectorAll('button');

		const event = new window.MouseEvent('click', { bubbles: true });

		buttons[0].dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<button>1</button>
			<button>0</button>`
		);

		buttons[1].dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`<button>1</button>
			<button>1</button>`
		);
	}
});
