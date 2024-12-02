import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<section>
			<div>Second</div>
		</section>
		<button>Click</button>
	`,
	async test({ assert, target, window }) {
		const button = target.querySelector('button');

		button?.dispatchEvent(new window.Event('click', { bubbles: true }));
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<section>
				<div>First</div>
				<div>Second</div>
			</section>
			<button>Click</button>
		`
		);
	}
});
