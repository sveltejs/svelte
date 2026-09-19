import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, '<button>0</button>');

		/** @type {HTMLButtonElement} */ (target.querySelector('button')).click();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<button>1</button>');
	}
});
