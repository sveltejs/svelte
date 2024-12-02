import { test } from '../../test';
import { flushSync } from 'svelte';

export default test({
	html: '<button>switch</button> Component1 Component1',
	async test({ assert, target }) {
		const btn = target.querySelector('button');

		btn?.click();
		flushSync();

		assert.htmlEqual(target.innerHTML, '<button>switch</button> Component2 Component2');
	}
});
