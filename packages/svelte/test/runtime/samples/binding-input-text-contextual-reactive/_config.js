export default {
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
		function set_text(i, text) {
			const input = target.querySelectorAll('input[type="text"]')[i];
			input.value = text;
			input.dispatchEvent(new window.Event('input'));
		}

		function set_done(i, done) {
			const input = target.querySelectorAll('input[type="checkbox"]')[i];
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
};
