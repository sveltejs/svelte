// https://github.com/sveltejs/svelte/issues/7633
export default {
	async test({ assert, target, component, window }) {
		let inputs = target.querySelectorAll('input');

		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);

		component.moveDown(0);
		component.moveDown(1);
		await Promise.resolve();

		assert.htmlEqual(
			target.innerHTML,
			`
				<div class="item">
					b <label><input name="current" type="radio" value="b"> current</label>
				</div>
				<div class="item">
					c <label><input name="current" type="radio" value="c"> current</label>
				</div>
				<div class="item">
					a <label><input name="current" type="radio" value="a"> current</label>
				</div>
			`
		);

		// after shifting order, should still keep the correct radio checked
		inputs = target.querySelectorAll('input');
		assert.equal(inputs[0].checked, false);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, true);

		(component.current = 'b');
		await Promise.resolve();

		inputs = target.querySelectorAll('input');
		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);

		component.moveDown(1);
		await Promise.resolve();

		// after shifting order, should still keep the correct radio checked
		inputs = target.querySelectorAll('input');
		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);
	}
};
