import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<button>off</button>
		<button>on</button>
		<button>off</button>
		<p>on: 1</p>
	`,

	test({ assert, component, target, window }) {
		const buttons = target.querySelectorAll('button');
		const event = new window.MouseEvent('click', { bubbles: true });

		buttons[0].dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>on</button>
			<button>on</button>
			<button>off</button>
			<p>on: 2</p>
		`
		);

		buttons[2].dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>on</button>
			<button>on</button>
			<button>on</button>
			<p>on: 3</p>
		`
		);

		assert.deepEqual(component.switches, [{ on: true }, { on: true }, { on: true }]);
	}
});
