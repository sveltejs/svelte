import { test } from '../../test';

export default test({
	get props() {
		return { flag: true };
	},

	html: `
		<span>Before</span>
		<span>Component</span>
		<span>After</span>
	`,

	test({ assert, component, target }) {
		component.flag = false;
		assert.htmlEqual(
			target.innerHTML,
			`
			<span>Before</span>
			<span>Component</span>
			<span>After</span>
		`
		);
	}
});
