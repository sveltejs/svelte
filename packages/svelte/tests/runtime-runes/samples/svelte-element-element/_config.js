import { test } from '../../test';

export default test({
	ssrHtml: `<div><p>children</p></div>`,
	test({ assert, target }) {
		assert.htmlEqual(target.innerHTML, `<div><b>children</b><p>children</p></div>`);
	}
});
