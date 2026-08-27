import { test } from '../../test';

export default test({
	ssrHtml: `<div></div>`,
	html: `<div><h1>hello</h1><h2>it's me</h2><h2>or not</h2></div>`,

	test() {}
});
