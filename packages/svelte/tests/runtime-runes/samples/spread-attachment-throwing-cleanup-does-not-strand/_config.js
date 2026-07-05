import { flushSync } from 'svelte';
import { test } from '../../test';

/** @type {string[]} */
let cleaned = [];

export default test({
	props: {
		attached: true,
		oncleanup: (/** @type {string} */ name) => cleaned.push(name)
	},

	test({ assert, component }) {
		cleaned.length = 0;

		// remove both spread attachments at once. `set_attributes` destroys the removed
		// attachment effects in a loop; the first attachment's cleanup throws. before
		// #18415's deferral that throw aborted the loop, stranding the second attachment —
		// its cleanup never ran. now the whole loop completes and the error surfaces once.
		component.attached = false;

		/** @type {unknown} */
		let thrown;
		try {
			flushSync();
		} catch (error) {
			thrown = error;
		}

		// (in DEV the message is suffixed with the component stack)
		assert.ok(
			/** @type {Error} */ (thrown)?.message.startsWith('first cleanup'),
			'the first cleanup error should still surface'
		);
		assert.deepEqual(cleaned, ['first', 'second'], 'both attachment cleanups ran');
	}
});
