import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	skip: true, // TODO: needs fixing

	html: `
		<button>Click Me</button>
		<div>1</div>
	`,
	async test({ assert, target, window }) {
		const button = target.querySelector('button');
		const event = new window.MouseEvent('click');
		/**
		 * @type {any[]}
		 */
		const messages = [];
		const log = console.log;
		console.log = (msg) => messages.push(msg);

		flushSync(() => {
			// @ts-ignore
			button.dispatchEvent(event);
		});

		console.log = log;
		assert.deepEqual(messages, ['afterUpdate', 'onDestroy']);
	}
});
