import { test } from '../../test';

export default test({
	html: `<p>hello</p>`,

	before_test: () => {
		// @ts-expect-error
		globalThis.frag = 'hello';
	},

	after_test: () => {
		// @ts-expect-error
		delete globalThis.frag;
	}
});
