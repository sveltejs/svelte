const message = 'the quick brown fox jumps over the lazy dog';
const expected = [...message].map((c) => `<span>${c + ' '}</span>`).join('');

export default {
	get props() {
		return { message };
	},

	async test({ assert, target }) {
		const first_span_list = target.children[0];
		assert.htmlEqualWithOptions(first_span_list.innerHTML, expected, {
			withoutNormalizeHtml: true
		});

		const second_span_list = target.children[1];
		assert.htmlEqualWithOptions(second_span_list.innerHTML, expected, {
			withoutNormalizeHtml: true
		});
	}
};
