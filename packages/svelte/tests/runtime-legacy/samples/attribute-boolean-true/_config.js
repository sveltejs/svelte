import { ok, test } from '../../test';

export default test({
	html: '<textarea readonly data-attr="true"></textarea>',
	test({ assert, target }) {
		const textarea = target.querySelector('textarea');
		ok(textarea);
		assert.equal(textarea.dataset.attr, 'true');
		assert.ok(textarea.readOnly);
	}
});
