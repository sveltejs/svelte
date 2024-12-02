import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<div>
			<button>click me</button>
			<p>captured: false</p>
		</div>
	`,

	test({ assert, target }) {
		const button = target.querySelector('button');

		button?.click();
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div>
					<button>click me</button>
					<p>captured: true</p>
				</div>
			`
		);
	}
});
