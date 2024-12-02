import { test } from '../../test';

export default test({
	error: {
		code: 'tag_invalid_name',
		message:
			'Expected a valid element or component name. Components must have a valid variable name or dot notation expression',
		position: [1, 8]
	}
});
