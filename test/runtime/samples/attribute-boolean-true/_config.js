export default {
	html: '<textarea readonly data-attr="true"></textarea>',
	test({ assert, target }) {
		const textarea = target.querySelector('textarea');
		assert.equal(textarea.dataset.attr, 'true');
		assert.ok(textarea.readOnly);
	}
};
