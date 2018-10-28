export default {
	html: `
		<p>selected: one</p>

		<select>
			<option value='one'>one</option>
			<option value='two'>two</option>
			<option value='three'>three</option>
		</select>

		<p>selected: one</p>
	`,

	ssrHtml: `
		<p>selected: one</p>

		<select value=one>
			<option value='one'>one</option>
			<option value='two'>two</option>
			<option value='three'>three</option>
		</select>

		<p>selected: one</p>
	`,

	data: {
		selected: 'one',
	},

	test(assert, component, target, window) {
		const select = target.querySelector('select');
		const options = [...target.querySelectorAll('option')];

		assert.deepEqual(options, select.options);
		assert.equal(component.get().selected, 'one');

		const change = new window.Event('change');

		options[1].selected = true;
		select.dispatchEvent(change);

		assert.equal(component.get().selected, 'two');
		assert.htmlEqual(target.innerHTML, `
			<p>selected: two</p>

			<select>
				<option value='one'>one</option>
				<option value='two'>two</option>
				<option value='three'>three</option>
			</select>

			<p>selected: two</p>
		`);

		component.set({ selected: 'three' });
	},
};
