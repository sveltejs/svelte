import { flushSync } from 'svelte';
import { test } from '../../test';

// overflow bitmask + slot missing `let:`
export default test({
	html: `
		<div>
			<button slot="target">Toggle inside 1</button>
		</div>
		<button>Toggle outside</button>
	`,

	test({ assert, target, window }) {
		const button = target.querySelectorAll('button')[1];
		const div = target.querySelector('div');
		div?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<button slot="target">Toggle inside 1</button>
				<div slot="content">Open</div>
			</div>
			<button>Toggle outside</button>
		`
		);

		button.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
		flushSync();
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<button slot="target">Toggle inside 2</button>
				<div slot="content">Open</div>
			</div>
			<button>Toggle outside</button>
		`
		);
	}
});
