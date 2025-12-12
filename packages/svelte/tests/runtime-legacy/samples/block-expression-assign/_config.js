import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const button = target.querySelector('button');

		assert.htmlEqual(target.innerHTML, `<div></div><button>inc</button> [0,0,0,0,0,0,0,0,0]`);
		flushSync(() => button?.click());
		assert.htmlEqual(target.innerHTML, `<div></div><button>inc</button> [0,0,0,0,0,0,0,0,0]`);
	}
});
