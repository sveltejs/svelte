import { test } from '../../test';

export default test({
	html: `
		<p>this &lt;em&gt;should&lt;/em&gt; not be <span>&lt;strong&gt;bold&lt;/strong&gt;</span></p>
	`
});
