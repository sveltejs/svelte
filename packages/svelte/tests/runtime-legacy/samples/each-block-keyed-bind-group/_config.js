import { flushSync } from 'svelte';
import { test } from '../../test';

export default test({
	html: `
		<label><input type="checkbox" value="Vanilla"> Vanilla</label>
		<label><input type="checkbox" value="Strawberry"> Strawberry</label>
		<label><input type="checkbox" value="Chocolate"> Chocolate</label>
		<label><input type="checkbox" value="Lemon"> Lemon</label>
		<label><input type="checkbox" value="Coconut"> Coconut</label>
	`,

	test({ assert, target, window }) {
		const [input1, input2, input3, input4, input5] = target.querySelectorAll('input');
		const event = new window.Event('change');

		input3.checked = true;
		input3.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<label><input type="checkbox" value="Chocolate"> Chocolate</label>
			<label><input type="checkbox" value="Vanilla"> Vanilla</label>
			<label><input type="checkbox" value="Strawberry"> Strawberry</label>
			<label><input type="checkbox" value="Lemon"> Lemon</label>
			<label><input type="checkbox" value="Coconut"> Coconut</label>
		`
		);

		assert.equal(input1.checked, false);
		assert.equal(input2.checked, false);
		assert.equal(input3.checked, true);
		assert.equal(input4.checked, false);
		assert.equal(input5.checked, false);

		input4.checked = true;
		input4.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<label><input type="checkbox" value="Chocolate"> Chocolate</label>
			<label><input type="checkbox" value="Lemon"> Lemon</label>
			<label><input type="checkbox" value="Vanilla"> Vanilla</label>
			<label><input type="checkbox" value="Strawberry"> Strawberry</label>
			<label><input type="checkbox" value="Coconut"> Coconut</label>
		`
		);

		assert.equal(input1.checked, false);
		assert.equal(input2.checked, false);
		assert.equal(input3.checked, true);
		assert.equal(input4.checked, true);
		assert.equal(input5.checked, false);

		input3.checked = false;
		input3.dispatchEvent(event);
		flushSync();

		assert.htmlEqual(
			target.innerHTML,
			`
			<label><input type="checkbox" value="Lemon"> Lemon</label>
			<label><input type="checkbox" value="Chocolate"> Chocolate</label>
			<label><input type="checkbox" value="Vanilla"> Vanilla</label>
			<label><input type="checkbox" value="Strawberry"> Strawberry</label>
			<label><input type="checkbox" value="Coconut"> Coconut</label>
		`
		);

		assert.equal(input1.checked, false);
		assert.equal(input2.checked, false);
		assert.equal(input3.checked, false);
		assert.equal(input4.checked, true);
		assert.equal(input5.checked, false);
	}
});
