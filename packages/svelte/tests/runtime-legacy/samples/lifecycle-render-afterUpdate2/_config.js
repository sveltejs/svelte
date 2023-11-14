import { test, ok } from '../../test';
import { flushSync } from 'svelte';

const log = console.log;
/** @type {string[]} */
let messages = [];

export default test({
	before_test: () => {
		console.log = (msg) => messages.push(msg);
		messages = [];
	},
	after_test: () => {
		console.log = log;
	},
	test({ assert, target, window }) {
		const [button1, button2] = target.querySelectorAll('button');
		ok(button1);
		ok(button2);

		button1.click();
		flushSync();
		button2.click();
		flushSync();

		assert.deepEqual(messages, ['after update 0, 0', 'after update 1, 0', 'after update 1, 1']);
		assert.htmlEqual(
			target.innerHTML,
			`
			<button>count:
			1</button><button>count
			2:
			1</button><hr>
			1
		`
		);
	}
});
