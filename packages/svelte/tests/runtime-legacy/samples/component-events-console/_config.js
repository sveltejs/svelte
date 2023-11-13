import { test } from '../../test';

export default test({
	html: '<button>click me</button>',

	test({ assert, target }) {
		const button = target.querySelector('button');

		/** @type {string[]} */
		const messages = [];

		const log = console.log;
		console.log = (msg) => {
			messages.push(msg);
		};

		try {
			button?.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
			assert.deepEqual(messages, ['clicked']);
		} catch (err) {
			console.log = log;
			throw err;
		}

		console.log = log;
	}
});
