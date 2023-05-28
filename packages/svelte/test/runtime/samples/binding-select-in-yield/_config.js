export default {
	html: '',

	get props() {
		return { letter: 'b' };
	},

	async test({ assert, component, target, window }) {
		await component.modal.toggle();

		assert.htmlEqual(
			target.innerHTML,
			`
			<span>b</span>

			<select>
				<option value='a'>a</option>
				<option value='b'>b</option>
				<option value='c'>c</option>
			</select>
		`
		);

		let select = target.querySelector('select');
		const change = new window.MouseEvent('change');

		select.options[2].selected = true;
		await select.dispatchEvent(change);
		assert.equal(component.letter, 'c');

		assert.deepEqual(
			Array.from(select.options).map((o) => o.selected),
			[false, false, true]
		);

		assert.htmlEqual(
			target.innerHTML,
			`
			<span>c</span>

			<select>
				<option value='a'>a</option>
				<option value='b'>b</option>
				<option value='c'>c</option>
			</select>
		`
		);

		await component.modal.toggle();
		await component.modal.toggle();

		select = target.querySelector('select');

		assert.deepEqual(
			Array.from(select.options).map((o) => o.selected),
			[false, false, true]
		);

		assert.htmlEqual(
			target.innerHTML,
			`
			<span>c</span>

			<select>
				<option value='a'>a</option>
				<option value='b'>b</option>
				<option value='c'>c</option>
			</select>
		`
		);
	}
};
