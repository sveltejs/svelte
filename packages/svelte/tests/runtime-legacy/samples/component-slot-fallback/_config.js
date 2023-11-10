import { test } from '../../test';

export default test({
	html: `
		<div>
			<p>not fallback</p>
			<p class='default'>bar fallback content</p>
			<p class='default'>foo fallback content</p>
		</div>
	`
});
