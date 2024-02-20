import { test } from '../../test';

export default test({
	error: {
		code: 'invalid-closing-tag-after-autoclose',
		message:
			'</p> attempted to close element that was already automatically closed by <pre> (cannot nest <pre> inside <p>)',
		position: [24, 24]
	}
});
