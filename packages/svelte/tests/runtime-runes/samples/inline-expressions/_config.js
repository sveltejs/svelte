import { test } from '../../test';

export default test({
	html: `
		<p>Without text expression: 7.36</p>
		<p>With text expression: 7.36</p>
		<p>With text expression and function call: 7.36</p>
		<p>With text expression and property access: 4</p>
		<h1>Hello name!</h1>
		<p>4</p>
		<h1>Tracking: true</h1>`,

	ssrHtml: `
		<p>Without text expression: 7.36</p>
		<p>With text expression: 7.36</p>
		<p>With text expression and function call: 7.36</p>
		<p>With text expression and property access: 4</p>
		<h1>Hello name!</h1>
		<p>4</p>
		<h1>Tracking: false</h1>`
});
