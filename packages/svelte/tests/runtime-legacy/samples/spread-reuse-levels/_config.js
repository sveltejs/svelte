import { test } from '../../test';

export default test({
	html: `
		<pre>{"a":1,"b":[1],"c":42}</pre>
		<pre>{"a":true,"b":true,"c":true}</pre>
	`,

	ssrHtml: `
		<pre>{"a":1,"b":[1],"c":42}</pre>
		<pre>{}</pre>
	`,

	test({ assert, component, target }) {
		component.a = 2;

		assert.htmlEqual(
			target.innerHTML,
			`
			<pre>{"a":2,"b":[1],"c":42}</pre>
			<pre>{"a":true,"b":false,"c":false}</pre>
		`
		);
	}
});
