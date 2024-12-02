import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
	  <button>destroy component</button>
	`,

	test({ assert, target, window, logs }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');

		// @ts-ignore
		button.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<button>destroy component</button>
		`
		);
		assert.deepEqual(logs, ['destroy']);
	}
});
