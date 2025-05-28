import { test } from '../../test';

export default test({
	ssrHtml: `
		<select>
			<option selected value="value" class="option">Label</option>
		</select>
	`,
	test({ assert, target, variant }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<select>
				<option ${variant === 'hydrate' ? 'selected ' : ''}value="value" class="option">Label</option>
			</select>
		`
		);
	}
});
