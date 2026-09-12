import { tick } from 'svelte';
import { test } from '../../test';

export default test({
	async test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, '<button>0</button>');

		// No explicit flushSync after the click — the update must still propagate
		// through the normal microtask flush.
		/** @type {HTMLButtonElement} */ (target.querySelector('button')).click();
		await tick();

		assert.htmlEqual(target.innerHTML, '<button>1</button>');
	}
});
