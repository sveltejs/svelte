import { test } from '../../test';

export default test({
	skip_no_async: true,
	mode: ['hydrate'],

	props: {
		key: '</script><script>throw new Error("pwned")</script>'
	},

	async test() {
		// this test will fail when evaluating the `head` script if the vulnerability is present
	}
});
