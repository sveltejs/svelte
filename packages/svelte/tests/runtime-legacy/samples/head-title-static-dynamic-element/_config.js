import { test } from '../../test';

export default test({
	test({ assert, window }) {
		assert.equal(window.document.title, 'changed');

		const meta = window.document.head.querySelector('meta');
		assert.htmlEqual(meta?.outerHTML || '', `<meta name='twitter:creator' content='@sveltejs'>`);
	}
});
