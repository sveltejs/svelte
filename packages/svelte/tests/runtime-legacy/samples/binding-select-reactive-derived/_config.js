import { test } from '../../test';

export default test({
	ssrHtml: `
		<select>
			<option selected="" value="">Select</option>
			<option value="us">US</option>
			<option value="uk">UK</option>
		</select>
	`,

	async test({ assert, target, window, variant }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<select>
				<option${variant === 'hydrate' ? ' selected=""' : ''} value="">Select</option>
				<option value="us">US</option>
				<option value="uk">UK</option>
			</select>
		`
		);

		const [select] = target.querySelectorAll('select');
		const options = target.querySelectorAll('option');

		assert.equal(select.value, '');

		const change = new window.Event('change');

		// Select "UK"
		options[2].selected = true;
		await select.dispatchEvent(change);

		assert.equal(select.value, 'uk');
	}
});
