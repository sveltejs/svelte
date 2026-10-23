import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	mode: ['client'],

	test({ assert, target, logs }) {
		const [btn1, btn2] = target.querySelectorAll('button');

		assert.deepEqual(logs, ['config', false, 'label', false]);
		assert.htmlEqual(
			target.innerHTML,
			'<spread-context-element label="x" title="a"><p>child</p></spread-context-element><button>a</button><button>active</button>'
		);

		flushSync(() => btn1.click());
		assert.htmlEqual(
			target.innerHTML,
			'<spread-context-element label="x" title="aa"><p>child</p></spread-context-element><button>aa</button><button>active</button>'
		);

		flushSync(() => btn2.click());
		assert.htmlEqual(
			target.innerHTML,
			'<spread-context-element class="active" label="x" title="aa"><p>child</p></spread-context-element><button>aa</button><button>active</button>'
		);
	}
});
