const values = [
	{ name: 'Alpha' },
	{ name: 'Beta' },
	{ name: 'Gamma' }
];

export default {
	props: {
		values,
		selected: [values[1]]
	},

	html: `
		<label>
			<input type="checkbox" value="[object Object]"> Alpha
		</label>

		<label>
			<input type="checkbox" value="[object Object]"> Beta
		</label>

		<label>
			<input type="checkbox" value="[object Object]"> Alpha
		</label>

		<label>
			<input type="checkbox" value="[object Object]"> Beta
		</label>

		<p>Beta</p>`,

	async test({ assert, component, target, window }) {
		const inputs = target.querySelectorAll('input');
		assert.equal(inputs[0].checked, false);
		assert.equal(inputs[1].checked, true);
		assert.equal(inputs[2].checked, false);
		assert.equal(inputs[3].checked, true);

		const event = new window.Event('change');

		inputs[0].checked = true;
		await inputs[0].dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<label>
				<input type="checkbox" value="[object Object]"> Alpha
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Beta
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Alpha
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Beta
			</label>

			<p>Alpha, Beta</p>
		`);

		inputs[1].checked = false;
		await inputs[1].dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<label>
				<input type="checkbox" value="[object Object]"> Alpha
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Beta
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Alpha
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Beta
			</label>

			<p>Alpha</p>
		`);

		component.selected = [values[0], values[1]];
		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, true);
		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, true);

		assert.htmlEqual(target.innerHTML, `
			<label>
				<input type="checkbox" value="[object Object]"> Alpha
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Beta
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Alpha
			</label>

			<label>
				<input type="checkbox" value="[object Object]"> Beta
			</label>

			<p>Alpha, Beta</p>
		`);
	}
};
