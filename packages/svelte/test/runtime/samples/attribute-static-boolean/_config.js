export default {
	html: '<textarea readonly=""></textarea>',
	test({ assert, target }) {
		const textarea = target.querySelector('textarea');
		assert.ok(textarea.readOnly);
	}
};
