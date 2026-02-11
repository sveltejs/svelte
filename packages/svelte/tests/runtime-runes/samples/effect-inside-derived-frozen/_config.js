import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, target }) {
		const [toggle, run] = target.querySelectorAll('button');

		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle</button><button>run</button><p>hello: 0</p>'
		);

		flushSync(() => run.click());
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle</button><button>run</button><p>hello: 1</p>'
		);

		flushSync(() => toggle.click());
		assert.htmlEqual(target.innerHTML, '<button>toggle</button><button>run</button>');

		flushSync(() => run.click());
		flushSync(() => run.click());
		flushSync(() => run.click());

		flushSync(() => toggle.click());
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle</button><button>run</button><p>hello: 1</p>'
		);

		flushSync(() => run.click());
		assert.htmlEqual(
			target.innerHTML,
			'<button>toggle</button><button>run</button><p>hello: 2</p>'
		);
	}
});
