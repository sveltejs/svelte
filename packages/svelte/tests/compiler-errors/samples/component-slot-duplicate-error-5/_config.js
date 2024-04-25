import { test } from '../../test';

export default test({
	error: {
		code: 'slot_attribute_duplicate',
		message: "Duplicate slot name 'foo' in <Nested>"
	}
});
