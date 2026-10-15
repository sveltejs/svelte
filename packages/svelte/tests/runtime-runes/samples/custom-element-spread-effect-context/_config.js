import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target, logs }) {
		assert.deepEqual(logs, ['config', false, 'label', false]);
		assert.htmlEqual(
			target.innerHTML,
			'<spread-context-element label="x" title="a"><p>child</p></spread-context-element><button>a</button>'
		);

		flushSync(() => target.querySelector('button')?.click());
		assert.htmlEqual(
			target.innerHTML,
			'<spread-context-element label="x" title="aa"><p>child</p></spread-context-element><button>aa</button>'
		);
	}
});
