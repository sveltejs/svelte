import { flushSync } from 'svelte';
import { ok, test } from '../../test';

export default test({
	html: '<button>reassign</button> <button>mutate</button> <p>0</p>',
	test({ assert, target }) {
		const [reassign, mutate] = target.querySelectorAll('button');
		const output = target.querySelector('p');
		ok(output);

		flushSync(() => mutate.click());
		assert.htmlEqual(output.innerHTML, '0');

		flushSync(() => reassign.click());
		assert.htmlEqual(output.innerHTML, '2');

		flushSync(() => mutate.click());
		assert.htmlEqual(output.innerHTML, '2');
	}
});
