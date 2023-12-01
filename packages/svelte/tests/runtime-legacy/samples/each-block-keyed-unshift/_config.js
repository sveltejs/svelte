import { test } from '../../test';

export default test({
	get props() {
		return { titles: [{ name: 'b' }, { name: 'c' }] };
	},

	html: `
		<p>b</p>
		<p>c</p>
	`,

	async test({ assert, component, target }) {
		component.titles = [{ name: 'a' }, { name: 'b' }, { name: 'c' }];

		await Promise.resolve();
		await Promise.resolve();
		await Promise.resolve();

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
