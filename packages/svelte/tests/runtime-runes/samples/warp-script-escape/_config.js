import { test } from '../../test';

export default test({
	skip_no_async: true,
	mode: ['hydrate'],
	props: {
		key: '</script><script>throw new Error("pwned")</script>'
	},
	test({ assert, window }) {
		const h1 = window.document.querySelector('h1');
		assert.equal(h1?.textContent, 'safe');
	}
});
