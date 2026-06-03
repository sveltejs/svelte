import { test } from '../../test';

export default test({
	ssrHtml: `<div></div>`,
	html: `<div><h1>hello</h1></div>`,

	test() {}
});
