import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: '<button>+1</button> 0, 1, 2',

	test({ target, assert }) {
		const btn = target.querySelector('button');

		flushSync(() => btn?.click());
		assert.htmlEqual(target.innerHTML, '<button>+1</button> 0, 1, 2, 3');
	}
});
