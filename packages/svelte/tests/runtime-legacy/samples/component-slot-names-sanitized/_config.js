import { test } from '../../test';

export default test({
	html: `
		<div>
			<h1 slot="header1">Header 1</h1>
			<h2 slot="-header2_">Header 2</h2>
			<h3 slot="3header">Header 3</h3>
			<h4 slot="_header4">Header 4</h4>
			<h5 slot="header-5">Header 5</h5>
			<h5 slot="header&5">Header 5b</h5>
		</div>
	`
});
