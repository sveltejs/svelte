import { test } from '../../test';

export default test({
	ssrHtml: `<input value="foo"><input value="foo"><input value="foo"><input value="bar"><input value="foo"><input value="foo"><input value="spread"><input type="checkbox" checked=""><input type="checkbox" checked=""><input type="checkbox"><input type="checkbox" checked=""><input type="checkbox"><input value="bar"><input type="checkbox">`,

	test({ assert, target }) {
		const [
			text,
			text_with_undefined_value,
			text_with_null_value,
			text_with_explicit_value,
			text_with_bound_value,
			text_with_spread_undefined_value,
			text_with_spread_explicit_value,
			checkbox,
			checkbox_with_undefined_checked,
			checkbox_with_false_checked,
			checkbox_with_bound_checked,
			checkbox_with_spread_false_checked,
			text_with_value,
			checkbox_with_checked
		] = target.querySelectorAll('input');

		assert.equal(text.value, 'foo');
		assert.equal(text_with_undefined_value.value, 'foo');
		assert.equal(text_with_null_value.value, 'foo');
		assert.equal(text_with_explicit_value.value, 'bar');
		assert.equal(text_with_bound_value.value, 'foo');
		assert.equal(text_with_spread_undefined_value.value, 'foo');
		assert.equal(text_with_spread_explicit_value.value, 'spread');
		assert.equal(checkbox.checked, true);
		assert.equal(checkbox_with_undefined_checked.checked, true);
		assert.equal(checkbox_with_false_checked.checked, false);
		assert.equal(checkbox_with_bound_checked.checked, true);
		assert.equal(checkbox_with_spread_false_checked.checked, false);
		assert.equal(text_with_value.value, 'bar');
		assert.equal(checkbox_with_checked.checked, false);
	}
});
