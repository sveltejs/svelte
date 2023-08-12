export default {
	skip_if_ssr: true,

	get props() {
		return { raw: '<p>does not change</p>' };
	},

	html: '<div><p>does not change</p></div>',

	test({ assert, component, target }) {
		const p = target.querySelector('p');

		component.raw = '<p>does not change</p>';
		assert.htmlEqualWithOptions(target.innerHTML, '<div><p>does not change</p></div>', {
			withoutNormalizeHtml: true
		});
		assert.strictEqual(target.querySelector('p'), p);
	}
};
