export default {
	html: `
		<div>
			<slot><p>not fallback</p></slot>
			<slot name='bar'><p class='default'>bar fallback content</p></slot>
			<slot name='foo'><p class='default'>foo fallback content</p></slot>
		</div>
	`
};
