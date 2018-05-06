export default {
	html: `
		<ul>
			<li><input></li>
			<li>bar</li>
			<li>baz</li>
		</ul>
	`,

	data: {
		components: [
			{ name: 'foo', edit: true },
			{ name: 'bar', edit: false },
			{ name: 'baz', edit: false }
		]
	}
};