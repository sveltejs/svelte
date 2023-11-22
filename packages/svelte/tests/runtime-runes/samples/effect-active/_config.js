import { test } from '../../test';

export default test({
	ssrHtml: `
		<p>false</p>
		<p>false</p>
		<p>false</p>
	`,

	html: `
		<p>false</p>
		<p>true</p>
		<p>true</p>
	`
});
