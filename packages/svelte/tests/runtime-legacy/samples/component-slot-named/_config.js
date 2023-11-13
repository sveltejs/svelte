import { test } from '../../test';

export default test({
	html: `
		<div>
			Hello
			<p slot='bar'>bar</p>
			<p slot='foo'>foo</p>
		</div>
	`
});
