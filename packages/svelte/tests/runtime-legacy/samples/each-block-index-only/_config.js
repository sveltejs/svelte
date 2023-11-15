import { test } from '../../test';

export default test({
	get props() {
		return { things: [0, 0, 0, 0, 0] };
	},

	html: `
		<p>0</p>
		<p>1</p>
		<p>2</p>
		<p>3</p>
		<p>4</p>
	`,

	test({ assert, component, target }) {
		component.things = [0, 0, 0];

		assert.htmlEqual(
			target.innerHTML,
			`
			<p>0</p>
			<p>1</p>
			<p>2</p>
		`
		);
	}
});
