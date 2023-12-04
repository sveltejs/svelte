import { test } from '../../test';

export default test({
	get props() {
		return { titles: [{ name: 'b' }, { name: 'c' }] };
	},

	html: `
		<p>b</p>
		<p>c</p>
	`,

	test({ assert, component, target }) {
		component.titles = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>a</p>
			<p>b</p>
			<p>c</p>
		`
		);
	}
});
