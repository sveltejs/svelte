import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
  <span>0 * 2 = 0</span>
  <button>Increase multiplier</button>
  <button>Increase count</button>
  `,

	test({ assert, target, window }) {
		const [multiplier, count] = target.querySelectorAll('button');
		const clickEvent = new window.Event('click', { bubbles: true });
		const span = /** @type {HTMLSpanElement} */ (target.querySelector('span'));

		/**
		 * @param {number} count
		 * @param {number} multiplier
		 */
		const expect_span_to_be = (count, multiplier) =>
			assert.htmlEqual(span.innerHTML, `${count} * ${multiplier} = ${count * multiplier}`);

		count.dispatchEvent(clickEvent);
		flushSync();
		expect_span_to_be(1, 2);

		multiplier.dispatchEvent(clickEvent);
		flushSync();
		expect_span_to_be(1, 3);

		count.dispatchEvent(clickEvent);
		flushSync();
		expect_span_to_be(2, 3);

		multiplier.dispatchEvent(clickEvent);
		flushSync();
		expect_span_to_be(2, 4);
	}
});
