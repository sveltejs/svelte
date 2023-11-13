import { test } from '../../test';

export default test({
	html: `
		<label><input type="checkbox" value="x"> x</label>
		<label><input type="checkbox" value="y"> y</label>
		<label><input type="checkbox" value="z"> z</label>
		<p></p>
		<label><input type="checkbox" value="x"> x</label>
		<label><input type="checkbox" value="y"> y</label>
		<label><input type="checkbox" value="z"> z</label>
		<p></p>
		<label><input type="checkbox" value="x"> x</label>
		<label><input type="checkbox" value="y"> y</label>
		<label><input type="checkbox" value="z"> z</label>
		<p></p>
	`,
	async test({ assert, target, window }) {
		const inputs = target.querySelectorAll('input');
		assert.equal(inputs[0].checked, false);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);

		assert.equal(inputs[3].checked, false);
		assert.equal(inputs[4].checked, false);
		assert.equal(inputs[5].checked, false);

		assert.equal(inputs[6].checked, false);
		assert.equal(inputs[7].checked, false);
		assert.equal(inputs[8].checked, false);

		const event = new window.Event('change');

		inputs[2].checked = true;
		await inputs[2].dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<label><input type="checkbox" value="x"> x</label>
			<label><input type="checkbox" value="y"> y</label>
			<label><input type="checkbox" value="z"> z</label>
			<p>z</p>
			<label><input type="checkbox" value="x"> x</label>
			<label><input type="checkbox" value="y"> y</label>
			<label><input type="checkbox" value="z"> z</label>
			<p></p>
			<label><input type="checkbox" value="x"> x</label>
			<label><input type="checkbox" value="y"> y</label>
			<label><input type="checkbox" value="z"> z</label>
			<p></p>
		`
		);

		inputs[4].checked = true;
		await inputs[4].dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<label><input type="checkbox" value="x"> x</label>
			<label><input type="checkbox" value="y"> y</label>
			<label><input type="checkbox" value="z"> z</label>
			<p>z</p>
			<label><input type="checkbox" value="x"> x</label>
			<label><input type="checkbox" value="y"> y</label>
			<label><input type="checkbox" value="z"> z</label>
			<p>y</p>
			<label><input type="checkbox" value="x"> x</label>
			<label><input type="checkbox" value="y"> y</label>
			<label><input type="checkbox" value="z"> z</label>
			<p></p>
		`
		);

		inputs[5].checked = true;
		await inputs[5].dispatchEvent(event);

		assert.htmlEqual(
			target.innerHTML,
			`
			<label><input type="checkbox" value="x"> x</label>
			<label><input type="checkbox" value="y"> y</label>
			<label><input type="checkbox" value="z"> z</label>
			<p>z</p>
			<label><input type="checkbox" value="x"> x</label>
			<label><input type="checkbox" value="y"> y</label>
			<label><input type="checkbox" value="z"> z</label>
			<p>y, z</p>
			<label><input type="checkbox" value="x"> x</label>
			<label><input type="checkbox" value="y"> y</label>
			<label><input type="checkbox" value="z"> z</label>
			<p></p>
		`
		);
	}
});
