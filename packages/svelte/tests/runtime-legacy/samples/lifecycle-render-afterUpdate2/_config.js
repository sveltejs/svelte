import { flushSync } from 'svelte';
import { log } from './log.js';
import { test, ok } from '../../test';

export default test({
	// somewhat troublingly, there's no way to make beforeUpdate/afterUpdate
	// behave as no-ops while testing SSR
	skip_if_ssr: true,
	skip_if_hydrate: true,

	before_test: () => {
		log.length = 0;
	},

	test({ assert, target }) {
		const [button1, button2] = target.querySelectorAll('button');
		ok(button1);
		ok(button2);

		button1.click();
		flushSync();

		button2.click();
		flushSync();

		assert.deepEqual(log, [
			'before',
			'before 0, 0',
			'after',
			'after 0, 0',
			'before',
			'before 1, 0',
			'after',
			'after 1, 0',
			'before',
			'before 1, 1',
			'after',
			'after 1, 1'
		]);

		assert.htmlEqual(
			target.innerHTML,
			`
				<button>a: 1</button>
				<button>b: 1</button>
				<p>a: 1</p>
			`
		);
	}
});
