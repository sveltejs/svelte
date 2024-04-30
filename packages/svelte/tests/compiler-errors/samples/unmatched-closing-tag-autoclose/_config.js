import { test } from '../../test';

export default test({
	error: {
		code: 'element_invalid_closing_tag_autoclosed',
		message:
			'`</p>` attempted to close element that was already automatically closed by `<pre>` (cannot nest `<pre>` inside `<p>`)',
		position: [24, 24]
	}
});
