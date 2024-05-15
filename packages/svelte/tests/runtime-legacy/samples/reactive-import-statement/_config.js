import { flushSync } from 'svelte';
import { ok, test } from '../../test';
import { reset_numbers } from './data';

export default test({
	html: `
		import
		<p>1 + 2 + 3 + 4 = 10</p>
		local
		<p>1 + 2 + 3 + 4 = 10</p>
		<button>Add a number</button>
	`,
	before_test() {
		reset_numbers();
	},
	async test({ assert, target, window }) {
		const btn = target.querySelector('button');
		ok(btn);

		const clickEvent = new window.MouseEvent('click', { bubbles: true });

		flushSync(() => {
			btn.dispatchEvent(clickEvent);
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			import
			<p>1 + 2 + 3 + 4 + 5 = 15</p>
			local
			<p>1 + 2 + 3 + 4 + 5 = 15</p>
			<button>Add a number</button>
		`
		);

		flushSync(() => {
			btn.dispatchEvent(clickEvent);
		});

		assert.htmlEqual(
			target.innerHTML,
			`
			import
			<p>1 + 2 + 3 + 4 + 5 + 6 = 21</p>
			local
			<p>1 + 2 + 3 + 4 + 5 + 6 = 21</p>
			<button>Add a number</button>
		`
		);
	}
});
