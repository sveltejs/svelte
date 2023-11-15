import { test } from '../../test';

export default test({
	html: `
	<div>
		<p class="default">default fallback content</p>
		<input slot="bar">
	</div>

	<div>
		<p class="default">default fallback content</p>
		bar fallback
	</div>
	`
});
