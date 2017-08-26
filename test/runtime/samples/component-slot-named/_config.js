export default {
	html: `
		<div>
			<slot>Hello</slot>
			<slot name='bar'><p slot='bar'>bar</p></slot>
			<slot name='foo'><p slot='foo'>foo</p></slot>
		</div>
	`
};
