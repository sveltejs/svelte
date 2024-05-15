import { test } from '../../test';

export default test({
	error: {
		code: 'slot_snippet_conflict',
		message:
			'Cannot use `<slot>` syntax and `{@render ...}` tags in the same component. Migrate towards `{@render ...}` tags completely',
		position: [71, 84]
	}
});
