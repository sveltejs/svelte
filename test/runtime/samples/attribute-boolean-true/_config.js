export default {
	html: `<textarea readonly></textarea>`,
	test({ assert, component, target }) {
		const textarea = target.querySelector('textarea');
		assert.ok(textarea.readOnly);
	},
};
