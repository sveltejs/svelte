import { test } from '../../test';

export default test({
	error: {
		code: 'unclosed-element',
		message: '<div> was left open',
		position: [0, 1]
	}
});
