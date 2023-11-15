import { ok, test } from '../../test';

export default test({
	html: '<textarea readonly=""></textarea>',
	test({ assert, target }) {
		const textarea = target.querySelector('textarea');
		ok(textarea);
		assert.ok(textarea.readOnly);
	}
});
