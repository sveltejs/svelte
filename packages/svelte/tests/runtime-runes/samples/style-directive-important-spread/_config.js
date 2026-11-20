import { test } from '../../test';

export default test({
	html: `
		<div title="x" style="background-color: blue; color: red !important;"></div>
		<p title="x" style="color: red !important;"></p>
		<select><option style="color: red !important;">a</option></select>
	`
});
