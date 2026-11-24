import { test } from '../../test';

export default test({
	compileOptions: { runes: undefined },
	html: `
		<div>fallback first</div>
		<div>fallback second</div>
		<p>runes</p>
		<span slot="named">named</span>
	`
});
