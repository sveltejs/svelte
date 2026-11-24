import { test } from '../../test';

export default test({
	mode: ['hydrate'],
	server_props: { show: true },
	props: { show: false },
	ssrHtml: '<p>failed</p> <p>after</p> <p>end</p>',
	transformError: () => 'error',

	test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, '<p>else</p> <p>end</p>');
	}
});
