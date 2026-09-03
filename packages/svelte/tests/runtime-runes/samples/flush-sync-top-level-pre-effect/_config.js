import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target, logs }) {
		// $effect.pre must have run during init, despite the top-level flushSync
		assert.deepEqual(logs, ['pre ran']);
		assert.htmlEqual(target.innerHTML, '<button>0</button>');

		/** @type {HTMLButtonElement} */ (target.querySelector('button')).click();
		flushSync();

		// reactivity must still work after the top-level flushSync
		assert.htmlEqual(target.innerHTML, '<button>1</button>');
		assert.deepEqual(logs, ['pre ran']);
	}
});
