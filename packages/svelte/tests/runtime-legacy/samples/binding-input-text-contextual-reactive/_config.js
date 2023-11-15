import { test } from '../../test';

export default test({
	get props() {
		return {
			items: [
				{ done: false, text: 'one' },
				{ done: true, text: 'two' },
				{ done: false, text: 'three' }
			]
		};
	},

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

	async test({ assert, component, target, window }) {
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

		await set_text(1, 'four');
		await Promise.resolve();

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

		assert.deepEqual(component.items, [
			{ done: false, text: 'one' },
			{ done: true, text: 'two' },
			{ done: false, text: 'four' }
		]);

		await set_done(0, true);
		await Promise.resolve();

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

		assert.deepEqual(component.items, [
			{ done: true, text: 'one' },
			{ done: true, text: 'two' },
			{ done: false, text: 'four' }
		]);

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
