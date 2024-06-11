import { test } from '../../test';

export default test({
	skip_mode: ['client'],

	test({ assert, target, hydrate }) {
		const inputs = /** @type {NodeListOf<HTMLInputElement>} */ (target.querySelectorAll('input'));
		inputs[1].checked = true;
		inputs[1].dispatchEvent(new window.Event('change'));
		// Hydration shouldn't reset the value to 1
		hydrate();

		assert.htmlEqual(
			target.innerHTML,
			'<input type="radio" value="1"><input type="radio" value="2"><input type="radio" value="3">\n2'
		);
	}
});
