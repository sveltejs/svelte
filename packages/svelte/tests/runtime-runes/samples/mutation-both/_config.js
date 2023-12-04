import { test } from '../../test';

export default test({
	html: `
  <span>0 * 2 = 0</span>
  <button>Increase multiplier</button>
  <button>Increase count</button>
  `,

	async test({ assert, target, window }) {
		const [multiplier, count] = target.querySelectorAll('button');
		const clickEvent = new window.Event('click', { bubbles: true });
		const span = /** @type {HTMLSpanElement} */ (target.querySelector('span'));

		/**
		 * @param {number} count
		 * @param {number} multiplier
		 */
		const expect_span_to_be = (count, multiplier) =>
			assert.htmlEqual(span.innerHTML, `${count} * ${multiplier} = ${count * multiplier}`);

		await count.dispatchEvent(clickEvent);
		expect_span_to_be(1, 2);

		await multiplier.dispatchEvent(clickEvent);
		expect_span_to_be(1, 3);

		await count.dispatchEvent(clickEvent);
		expect_span_to_be(2, 3);

		await multiplier.dispatchEvent(clickEvent);
		expect_span_to_be(2, 4);
	}
});
