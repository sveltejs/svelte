import { test } from '../../test';

export default test({
	html: `
		<span style="color: red;">Text</span>
	`,
	ssrHtml: `
		<span>Text</span>
	`
});
