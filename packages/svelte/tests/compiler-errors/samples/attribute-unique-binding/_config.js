import { test } from '../../test';

export default test({
	error: {
		code: 'duplicate-attribute',
		message: 'Attributes need to be unique',
		position: [17, 17]
	}
});
