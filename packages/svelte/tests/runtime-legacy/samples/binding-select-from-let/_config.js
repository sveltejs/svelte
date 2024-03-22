import { test } from '../../test';

export default test({
	html: `
		<select>
			<option value='do laundry'>do laundry</option>
			<option value='do taxes'>do taxes</option>
			<option value='cook food'>cook food</option>
			<option value='watch the kids'>watch the kids</option>
		</select>
	`,

	async test({ assert, component, target, window }) {
		const select = target.querySelector('select');
		const options = target.querySelectorAll('option');

		const change = new window.Event('change');
		options[1].selected = true;
		// @ts-ignore
		await select.dispatchEvent(change);

		assert.equal(component.selected, options[1].value);
	}
});
