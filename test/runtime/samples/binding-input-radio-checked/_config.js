export default {
	data: {
		foo: false,
		bar: true,
		baz: false,
	},

	html: `
		<label>
			<input type="radio" name="x"> foo
		</label>

		<label>
			<input type="radio" name="x"> bar
		</label>

		<label>
			<input type="radio" name="x"> baz
		</label>

		<p>foo false</p>
		<p>bar true</p>
		<p>baz false</p>`,

	test(assert, component, target, window) {
		const inputs = target.querySelectorAll('input');
		assert.equal(inputs[0].checked, false);
		assert.equal(inputs[1].checked, true);
		assert.equal(inputs[2].checked, false);

		const event = new window.Event('change');

		inputs[0].checked = true;
		inputs[0].dispatchEvent(event);

		assert.htmlEqual(target.innerHTML, `
			<label>
				<input type="radio" name="x"> foo
			</label>

			<label>
				<input type="radio" name="x"> bar
			</label>

			<label>
				<input type="radio" name="x"> baz
			</label>

			<p>foo true</p>
			<p>bar false</p>
			<p>baz false</p>
		`);

		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);

		component.set({ baz: true });
		assert.equal(inputs[0].checked, false);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, true);

		assert.htmlEqual(target.innerHTML, `
			<label>
				<input type="radio" value="[object Object]"> Alpha
			</label>

			<label>
				<input type="radio" value="[object Object]"> Beta
			</label>

			<label>
				<input type="radio" value="[object Object]"> Gamma
			</label>

			<p>foo false</p>
			<p>bar false</p>
			<p>baz true</p>
		`);
	},
};
