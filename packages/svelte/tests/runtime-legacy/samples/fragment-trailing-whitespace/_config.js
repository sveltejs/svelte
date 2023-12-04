import { test } from '../../test';

const message = 'the quick brown fox jumps over the lazy dog';
// In Svelte 4 this was `<span>${c} </span>` - whitespace behavior change
const expected = [...message].map((c) => `<span>${c}</span>`).join('');

export default test({
	get props() {
		return { message };
	},

	async test({ assert, target }) {
		const firstSpanList = target.children[0];
		assert.htmlEqualWithOptions(firstSpanList.innerHTML, expected, {
			withoutNormalizeHtml: true,
			preserveComments: false
		});

		const secondSpanList = target.children[1];
		assert.htmlEqualWithOptions(secondSpanList.innerHTML, expected, {
			withoutNormalizeHtml: true,
			preserveComments: false
		});
	}
});
