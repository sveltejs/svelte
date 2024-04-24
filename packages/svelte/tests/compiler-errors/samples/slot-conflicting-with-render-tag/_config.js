import { test } from '../../test';

export default test({
	error: {
		code: 'conflicting_slot_usage',
		message:
			'Cannot use `<slot>` syntax and `{@render ...}` tags in the same component. Migrate towards `{@render ...}` tags completely.',
		position: [71, 84]
	}
});
