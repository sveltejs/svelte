import { test } from '../../test';

export default test({
	get props() {
		return { x: true };
	},

	html: `
		<p>parent green</p>
		<p>green green</p>
	`,

	test({ assert, component, target }) {
		component.foo = undefined;
		component.x = false;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>parent red</p>
			<p>red red</p>
		`
		);

		component.foo = undefined;
		component.x = true;

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>parent green</p>
			<p>green green</p>
		`
		);
	}
});
