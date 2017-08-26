export default {
	html: `
		<div>
			<slot>default fallback content</slot>
			<slot name='bar'>bar fallback content</slot>
			<slot name='foo'>foo fallback content</slot>
		</div>
	`
};
