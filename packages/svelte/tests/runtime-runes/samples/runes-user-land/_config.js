import { test } from '../../test';

export default test({
	compileOptions: {
		runes: 'user_land'
	},

	test({ assert, target }) {
		assert.htmlEqual(
			target.innerHTML,
			'<p>1</p><p class="explicit-runes">42</p><p class="explicit-legacy">99</p>'
		);
	}
});
