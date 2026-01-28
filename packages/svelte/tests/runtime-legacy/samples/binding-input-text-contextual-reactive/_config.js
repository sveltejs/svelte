import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<div>
			<input type="checkbox">
			<input type="text"><p>one</p>
		</div>
		<div>
			<input type="checkbox">
			<input type="text"><p>two</p>
		</div>
		<div>
			<input type="checkbox">
			<input type="text"><p>three</p>
		</div>

		<p>remaining:one / done:two / remaining:three</p>
	`,

	ssrHtml: `
		<div>
			<input type="checkbox">
			<input type="text" value=one><p>one</p>
		</div>
		<div>
			<input type="checkbox" checked="">
			<input type="text" value=two><p>two</p>
		</div>
		<div>
			<input type="checkbox">
			<input type="text" value=three><p>three</p>
		</div>

		<p>remaining:one / done:two / remaining:three</p>
	`,

	test({ assert, component, target, window }) {
		/**
		 * @param {number} i
		 * @param {string} text
		 */
		function set_text(i, text) {
			const input = /** @type {HTMLInputElement} */ (
				target.querySelectorAll('input[type="text"]')[i]
			);
			input.value = text;
			input.dispatchEvent(new window.Event('input'));
		}

		/**
		 * @param {number} i
		 * @param {boolean} done
		 */
		function set_done(i, done) {
			const input = /** @type {HTMLInputElement} */ (
				target.querySelectorAll('input[type="checkbox"]')[i]
			);
			input.checked = done;
			input.dispatchEvent(new window.Event('change'));
		}

		component.filter = 'remaining';

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<input type="checkbox">
				<input type="text"><p>one</p>
			</div>
			<div>
				<input type="checkbox">
				<input type="text"><p>three</p>
			</div>

			<p>remaining:one / done:two / remaining:three</p>
		`
		);

		set_text(1, 'four');
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<input type="checkbox">
				<input type="text"><p>one</p>
			</div>
			<div>
				<input type="checkbox">
				<input type="text"><p>four</p>
			</div>

			<p>remaining:one / done:two / remaining:four</p>
		`
		);

		set_done(0, true);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<input type="checkbox">
				<input type="text"><p>four</p>
			</div>

			<p>done:one / done:two / remaining:four</p>
		`
		);

		component.filter = 'done';

		assert.htmlEqual(
			target.innerHTML,
			`
			<div>
				<input type="checkbox">
				<input type="text"><p>one</p>
			</div>
			<div>
				<input type="checkbox">
				<input type="text"><p>two</p>
			</div>

			<p>done:one / done:two / remaining:four</p>
		`
		);
	}
});
