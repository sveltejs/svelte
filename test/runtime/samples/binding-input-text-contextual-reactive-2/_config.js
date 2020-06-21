export default {
	html: `
		<div>
			<input type="checkbox">
			<input type="text">
			<p>one</p>
		</div>
		<div>
			<input type="checkbox">
			<input type="text">
			<p>two</p>
		</div>
		<div>
			<input type="checkbox">
			<input type="text">
			<p>three</p>
		</div>
		<p>completed 1, remaining 2, total 3</p>
	`,

	ssrHtml: `
		<div>
			<input type="checkbox">
			<input type="text" value="one">
			<p>one</p>
		</div>
		<div>
			<input checked="" type="checkbox">
			<input type="text" value="two">
			<p>two</p>
		</div>
		<div>
			<input type="checkbox">
			<input type="text" value="three">
			<p>three</p>
		</div>
		<p>completed 1, remaining 2, total 3</p>
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

		assert.htmlEqual(target.innerHTML, `
			<div>
				<input type="checkbox">
				<input type="text">
				<p>one</p>
			</div>
			<div>
				<input type="checkbox">
				<input type="text">
				<p>three</p>
			</div>
			<p>completed 1, remaining 2, total 3</p>
		`);

		await set_text(1, 'four');

		assert.htmlEqual(target.innerHTML, `
			<div>
				<input type="checkbox">
				<input type="text">
				<p>one</p>
			</div>
			<div>
				<input type="checkbox">
				<input type="text">
				<p>four</p>
			</div>
			<p>completed 1, remaining 2, total 3</p>
		`);

		await set_done(0, true);

		assert.htmlEqual(target.innerHTML, `
			<div>
				<input type="checkbox">
				<input type="text">
				<p>four</p>
			</div>
			<p>completed 2, remaining 1, total 3</p>
		`);

		component.filter = 'done';

		assert.htmlEqual(target.innerHTML, `
			<div>
				<input type="checkbox">
				<input type="text">
				<p>one</p>
			</div>
			<div>
				<input type="checkbox">
				<input type="text">
				<p>two</p>
			</div>
			<p>completed 2, remaining 1, total 3</p>
		`);
	},
};
