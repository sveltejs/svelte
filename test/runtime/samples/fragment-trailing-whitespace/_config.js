const message = 'the quick brown fox jumps over the lazy dog';
const expected = [...message].map((c) => `<span>${c + ' '}</span>`).join('');

export default {
	get props() {
		return { message };
	},

	async test({ assert, target }) {
		const firstSpanList = target.children[0];
		assert.htmlEqualWithOptions(firstSpanList.innerHTML, expected, { withoutNormalizeHtml: true });

		const secondSpanList = target.children[1];
		assert.htmlEqualWithOptions(secondSpanList.innerHTML, expected, { withoutNormalizeHtml: true });
	}
};
