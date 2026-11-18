import { flushSync } from 'svelte';
import { test } from '../../test-dom.test';

export default test({
	hydrate: true,
	html: '<button>0</button> <custom-root><b>hello</b></custom-root> <p>after</p>',
	test({ assert, target, serialize_dom, warnings }) {
		const [button] = target.querySelectorAll('button');
		const p = target.querySelector('p');

		button.click();
		flushSync();

		// the server-rendered DOM was hydrated, not replaced
		assert.equal(target.querySelector('p'), p);
		assert.equal(
			serialize_dom(target),
			'<button>1</button> <custom-root><b>hello</b></custom-root> <p>after</p>'
		);
		assert.deepEqual(warnings, []);
	}
});
