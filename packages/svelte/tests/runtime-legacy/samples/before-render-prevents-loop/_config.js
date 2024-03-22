import { test } from '../../test';

export default test({
	skip_if_ssr: true,

	get props() {
		return { value: 'hello!' };
	},

	html: `
		<p>hello!</p>
		<p>hello!</p>
	`,

	test({ assert, component, target }) {
		component.value = 'goodbye!';
		assert.htmlEqual(
			target.innerHTML,
			`
			<p>goodbye!</p>
			<p>goodbye!</p>
		`
		);
	}
});
