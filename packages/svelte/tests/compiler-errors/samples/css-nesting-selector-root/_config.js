import { test } from '../../test';

export default test({
	error: {
		code: 'css_nesting_selector_invalid_placement',
		message:
			'Nesting selectors can only be used inside a rule or as the first selector inside a lone `:global(...)`',
		position: [151, 152]
	}
});
