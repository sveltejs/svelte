const ns = '<noscript></noscript>';

export default {
	skip_if_ssr: true,

	props: {
		raw: '<span><em>raw html!!!\\o/</span></em>'
	},

	html: `before${ns}<span><em>raw html!!!\\o/</span></em>${ns}after`,

	test({ assert, component, target }) {
		component.raw = '';
		assert.equal(target.innerHTML, `before${ns}${ns}after`);
		component.raw = 'how about <strong>unclosed elements?';
		assert.equal(target.innerHTML, `before${ns}how about <strong>unclosed elements?</strong>${ns}after`);
		component.$destroy();
		assert.equal(target.innerHTML, '');
	}
};
