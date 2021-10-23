export default {
	html: `
		<p>selected: undefined</p>

		<select>
			<option value='a'>a</option>
			<option value='b'>b</option>
			<option value='c' selected>c</option>
		</select>

		<p>selected: undefined</p>
	`,

	async test({ assert, target }) {
		const select = target.querySelector('select');
		assert.equal(select.value, 'c');
	}
};
