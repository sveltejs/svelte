import { test } from '../../test';

export default test({
	// Payload that would close an HTML comment early and inject arbitrary HTML
	// if idPrefix were embedded without sanitization: <!--$-->injected<!--s1-->
	id_prefix: '-->injected<!--'
});
