import { test } from '../../test';

export default test({
	error: {
		code: 'unclosed-comment',
		message: 'comment was left open, expected -->',
		position: [24, 24]
	}
});
