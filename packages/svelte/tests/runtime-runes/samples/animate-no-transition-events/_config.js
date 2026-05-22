import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	test({ assert, raf, target, logs }) {
		let divs = target.querySelectorAll('div');
		divs.forEach((div) => {
			// @ts-expect-error
			div.getBoundingClientRect = function () {
				// @ts-expect-error
				const index = [...this.parentNode.children].indexOf(this);
				const top = index * 30;

				return {
					left: 0,
					right: 100,
					top,
					bottom: top + 20
				};
			};
		});

		const [btn] = target.querySelectorAll('button');
		flushSync(() => btn.click());

		raf.tick(1);
		assert.deepEqual(logs, []);
		raf.tick(100);
		assert.deepEqual(logs, []);
	}
});
