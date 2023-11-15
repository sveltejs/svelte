import { test } from '../../test';

export default test({
	html: `
		<ul>
			<li><input></li>
			<li>bar</li>
			<li>baz</li>
		</ul>
	`,

	ssrHtml: `
		<ul>
			<li><input value=foo></li>
			<li>bar</li>
			<li>baz</li>
		</ul>
	`,

	get props() {
		return {
			components: [
				{ name: 'foo', edit: true },
				{ name: 'bar', edit: false },
				{ name: 'baz', edit: false }
			]
		};
	}
});
