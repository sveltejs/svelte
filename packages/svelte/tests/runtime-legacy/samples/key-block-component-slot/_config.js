import { flushSync } from 'svelte';
import { test } from '../../test';

/** @type {string[]} */
let logs = [];

export default test({
	html: '<button>Reset!</button>',
	get props() {
		return { logs };
	},

	before_test() {
		logs = [];
	},

	test({ assert, target }) {
		assert.deepEqual(logs, ['mount']);

		const button = target.querySelector('button');

		const click = new window.MouseEvent('click', { bubbles: true });
		button?.dispatchEvent(click);
		flushSync();

		assert.deepEqual(logs, ['mount', 'unmount', 'mount']);
	}
});
