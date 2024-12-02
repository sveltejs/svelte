import { test } from '../../test';

export default test({
	error: {
		code: 'attribute_duplicate',
		message: 'Attributes need to be unique',
		position: [17, 25]
	}
});
