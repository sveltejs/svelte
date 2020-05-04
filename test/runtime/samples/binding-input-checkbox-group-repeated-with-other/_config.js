const values = [
	"a",
	"b",
];

export default {
	props: {
		values,
		selected: [],
		selected2: []
	},

	async test({ assert, target, window }) {
		const inputs = target.querySelectorAll('input');
		assert.equal(inputs[0].checked, false);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);
		assert.equal(inputs[3].checked, false);
		assert.equal(inputs[4].checked, false);
		assert.equal(inputs[5].checked, false);

		const event = new window.Event('change');

		inputs[5].checked = true;
		await inputs[5].dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<label>
				<input type="checkbox" value="a"> a
			</label>

			<label>
				<input type="checkbox" value="b"> b
			</label>

			<label>
				<input type="checkbox" value="a"> a
			</label>

			<label>
				<input type="checkbox" value="b"> b
			</label>

			<p></p>

			<label>
				<input type="checkbox" value="a"> a
			</label>

			<label>
				<input type="checkbox" value="b"> b
			</label>

			<p>b</p>
		`);

		inputs[3].checked = true;
		await inputs[3].dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<label>
				<input type="checkbox" value="a"> a
			</label>

			<label>
				<input type="checkbox" value="b"> b
			</label>

			<label>
				<input type="checkbox" value="a"> a
			</label>

			<label>
				<input type="checkbox" value="b"> b
			</label>

			<p>b</p>

			<label>
				<input type="checkbox" value="a"> a
			</label>

			<label>
				<input type="checkbox" value="b"> b
			</label>

			<p>b</p>
		`);

	}
};
