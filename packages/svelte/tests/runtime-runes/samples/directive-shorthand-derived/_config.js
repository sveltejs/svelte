import { test } from '../../test';

export default test({
	ssrHtml: `
		<div style="position: relative; width: 10px;"></div>
		<div style="position: relative; width: 10px;"></div>
	`,
	html: `
		<div style="position: relative; width: 10px;"></div>
		<div style="position: relative; width: 10px;"></div>
	`
});
