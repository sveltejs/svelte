import { test } from '../../test';

export default test({
	ssrHtml: `<main><p>children</p></main>`,
	test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, `<div><b>children</b><p>children</p></div>`);
	}
});
