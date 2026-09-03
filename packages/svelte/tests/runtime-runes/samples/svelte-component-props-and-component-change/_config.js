import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	compileOptions: {
		dev: true
	},

	async test({ assert, target, logs }) {
		const [btn] = target.querySelectorAll('button');

		// Swap Comp1 -> Comp2, changing the props at the same time
		btn.click();
		flushSync();

		// Swap Comp2 -> Comp1 again
		btn.click();
		flushSync();

		// The outgoing component must never observe props belonging to the incoming
		// component (which would log e.g. `prop1 update undefined`) — see #16135
		assert.deepEqual(logs, [
			'prop1',
			'init',
			'prop1',
			'prop2',
			'init',
			'prop2',
			'prop1',
			'init',
			'prop1'
		]);
	}
});
