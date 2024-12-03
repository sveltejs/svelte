import { test } from '../../test';

export default test({
	error: {
		code: 'export_undefined',
		message: '`blah` is not defined',
		position: [26, 30]
	}
});
