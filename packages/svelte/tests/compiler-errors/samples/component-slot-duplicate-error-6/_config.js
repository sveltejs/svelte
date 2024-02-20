import { test } from '../../test';

export default test({
	error: {
		code: 'duplicate-slot-name',
		message: "Duplicate slot name 'foo' in <Nested>"
	}
});
