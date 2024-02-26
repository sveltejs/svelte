import { test } from '../../test';

export default test({
	html: '<textarea></textarea>',

	test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			<textarea></textarea>
		`
		);
	}
});
