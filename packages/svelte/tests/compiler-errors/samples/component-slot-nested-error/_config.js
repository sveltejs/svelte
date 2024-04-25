import { test } from '../../test';

export default test({
	error: {
		code: 'slot_attribute_invalid_placement',
		message:
			"Element with a slot='...' attribute must be a child of a component or a descendant of a custom element"
	}
});
