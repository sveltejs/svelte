export default {
	html: '<textarea></textarea>',
	test({ assert, target }) {
		const textarea = target.querySelector('textarea');
		assert.ok(textarea.readOnly === false);
	}
};
