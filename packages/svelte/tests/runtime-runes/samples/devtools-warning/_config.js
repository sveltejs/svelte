import { flushSync } from 'svelte';
import { listen } from 'svelte/internal/devtools';
import { test } from '../../test';

/** @type {Array<[string, unknown[]]>} */
const emitted = [];

/** @type {() => void} */
let unlisten;

export default test({
	mode: ['client'],
	compileOptions: { dev: true },

	before_test() {
		emitted.length = 0;

		unlisten = listen({
			name: 'test',
			warningEmitted(code, args) {
				emitted.push([code, args]);
			}
		});
	},

	after_test() {
		unlisten();
	},

	test({ assert, target, warnings, logs }) {
		const [button] = target.querySelectorAll('button');
		flushSync(() => button.click());

		assert.deepEqual(emitted, [['console_log_state', ['log']]]);
		assert.equal(warnings.length, 1);
		warnings.length = 0;
		logs.length = 0;
	}
});
