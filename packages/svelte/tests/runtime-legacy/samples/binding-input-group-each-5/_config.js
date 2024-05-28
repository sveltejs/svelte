import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<label><input type="checkbox" value="1"> 1</label>
		<label><input type="checkbox" value="2"> 2</label>
		<label><input type="checkbox" value="3"> 3</label>
		<p>1</p>
		<label><input type="checkbox" value="1"> 1</label>
		<label><input type="checkbox" value="2"> 2</label>
		<label><input type="checkbox" value="3"> 3</label>
		<p>1, 2, 3</p>
		<label><input type="checkbox" value="1"> 1</label>
		<label><input type="checkbox" value="2"> 2</label>
		<label><input type="checkbox" value="3"> 3</label>
		<p>2</p>
		<label><input type="checkbox" value="1"> 1</label>
		<label><input type="checkbox" value="2"> 2</label>
		<label><input type="checkbox" value="3"> 3</label>
		<p>1</p>
	`,
	ssrHtml: `
		<label><input type="checkbox" value="1" checked> 1</label>
		<label><input type="checkbox" value="2"> 2</label>
		<label><input type="checkbox" value="3"> 3</label>
		<p>1</p>
		<label><input type="checkbox" value="1" checked> 1</label>
		<label><input type="checkbox" value="2" checked> 2</label>
		<label><input type="checkbox" value="3" checked> 3</label>
		<p>1, 2, 3</p>
		<label><input type="checkbox" value="1"> 1</label>
		<label><input type="checkbox" value="2" checked> 2</label>
		<label><input type="checkbox" value="3"> 3</label>
		<p>2</p>
		<label><input type="checkbox" value="1" checked> 1</label>
		<label><input type="checkbox" value="2"> 2</label>
		<label><input type="checkbox" value="3"> 3</label>
		<p>1</p>
	`,
	test({ assert, component, target, window }) {
		const inputs = target.querySelectorAll('input');
		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, false);
		assert.equal(inputs[2].checked, false);

		assert.equal(inputs[3].checked, true);
		assert.equal(inputs[4].checked, true);
		assert.equal(inputs[5].checked, true);

		assert.equal(inputs[6].checked, false);
		assert.equal(inputs[7].checked, true);
		assert.equal(inputs[8].checked, false);

		assert.equal(inputs[9].checked, true);
		assert.equal(inputs[10].checked, false);
		assert.equal(inputs[11].checked, false);

		const event = new window.Event('change');

		inputs[2].checked = true;
		inputs[2].dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1, 3</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1, 2, 3</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>2</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1</p>
		`
		);

		inputs[8].checked = true;
		inputs[8].dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1, 3</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1, 2, 3</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>2, 3</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1</p>
		`
		);

		component.selected_index = [1, 1];

		assert.htmlEqual(
			target.innerHTML,
			`
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1, 2, 3</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1, 2, 3</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1</p>
		`
		);

		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, true);
		assert.equal(inputs[2].checked, true);

		assert.equal(inputs[3].checked, true);
		assert.equal(inputs[4].checked, true);
		assert.equal(inputs[5].checked, true);

		assert.equal(inputs[6].checked, true);
		assert.equal(inputs[7].checked, false);
		assert.equal(inputs[8].checked, false);

		assert.equal(inputs[9].checked, true);
		assert.equal(inputs[10].checked, false);
		assert.equal(inputs[11].checked, false);

		inputs[5].checked = false;
		inputs[5].dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1, 2</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1, 2</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1</p>
			<label><input type="checkbox" value="1"> 1</label>
			<label><input type="checkbox" value="2"> 2</label>
			<label><input type="checkbox" value="3"> 3</label>
			<p>1</p>
		`
		);

		assert.equal(inputs[0].checked, true);
		assert.equal(inputs[1].checked, true);
		assert.equal(inputs[2].checked, false);

		assert.equal(inputs[3].checked, true);
		assert.equal(inputs[4].checked, true);
		assert.equal(inputs[5].checked, false);

		assert.equal(inputs[6].checked, true);
		assert.equal(inputs[7].checked, false);
		assert.equal(inputs[8].checked, false);

		assert.equal(inputs[9].checked, true);
		assert.equal(inputs[10].checked, false);
		assert.equal(inputs[11].checked, false);
	}
});
