import { test } from '../../test';

export default test({
	html: `<div>Hello</div>`,

	async test({ assert, target }) {
		assert.htmlEqual(
			target.ownerDocument.head.innerHTML,
			`<script async="" src="https://www.googletagmanager.com/gtag/js?id=12345"></script><meta content="Some description" name="description"><meta content="@svelteawesome" name="author"><title>Hello world</title>`
		);
	}
});
