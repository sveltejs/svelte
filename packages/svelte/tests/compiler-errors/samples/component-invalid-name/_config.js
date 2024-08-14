import { test } from '../../test';

export default test({
	error: {
		code: 'component_invalid_name',
		message:
			'`Components[1]` is not a valid component name. A component name can be an identifier, or a member expression with dot notation.',
		position: [1, 14]
	}
});
