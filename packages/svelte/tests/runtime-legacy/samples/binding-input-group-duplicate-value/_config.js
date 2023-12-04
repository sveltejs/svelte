import { ok, test } from '../../test';

export default test({
	html: `
		<p>Checked: </p>

		<hr>

		<input type='checkbox' value='a'>a<br>
		<input type='checkbox' value='b'>b<br>
		<input type='checkbox' value='c'>c<br>
		<input type='checkbox' value='d'>d<br>

		<hr>

		<input type='checkbox' value='a'>a<br>
		<input type='checkbox' value='b'>b<br>
		<input type='checkbox' value='c'>c<br>
		<input type='checkbox' value='d'>d<br>
	`,

	async test({ assert, target, window }) {
		const inputs = target.querySelectorAll('input');
		const p = target.querySelector('p');
		ok(p);

		assert.equal(inputs[0].checked, false);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);
		assert.equal(inputs[3].checked, false);

		assert.equal(inputs[4].checked, false);
		assert.equal(inputs[5].checked, false);
		assert.equal(inputs[6].checked, false);
		assert.equal(inputs[7].checked, false);

		const event = new window.Event('change');

		inputs[0].checked = true;
		await inputs[0].dispatchEvent(event);

		assert.htmlEqual(p.innerHTML, 'Checked: a');

		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);
		assert.equal(inputs[3].checked, false);

		assert.equal(inputs[4].checked, true);
		assert.equal(inputs[5].checked, false);
		assert.equal(inputs[6].checked, false);
		assert.equal(inputs[7].checked, false);

		inputs[3].checked = true;
		await inputs[3].dispatchEvent(event);

		assert.htmlEqual(p.innerHTML, 'Checked: a,d');

		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);
		assert.equal(inputs[3].checked, true);

		assert.equal(inputs[4].checked, true);
		assert.equal(inputs[5].checked, false);
		assert.equal(inputs[6].checked, false);
		assert.equal(inputs[7].checked, true);

		inputs[4].checked = false;
		await inputs[4].dispatchEvent(event);

		assert.htmlEqual(p.innerHTML, 'Checked: d');

		assert.equal(inputs[0].checked, false);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);
		assert.equal(inputs[3].checked, true);

		assert.equal(inputs[4].checked, false);
		assert.equal(inputs[5].checked, false);
		assert.equal(inputs[6].checked, false);
		assert.equal(inputs[7].checked, true);
	}
});
