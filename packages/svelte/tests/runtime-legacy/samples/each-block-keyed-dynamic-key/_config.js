import { test } from '../../test';

let count = 0;
let value = 'foo';

export default test({
	get props() {
		return {
			value() {
				count++;
				return value;
			}
		};
	},

	before_test() {
		count = 0;
		value = 'foo';
	},

	html: `
		<div>foo</div>
		<div>foo</div>
	`,

	test({ assert, component, target }) {
		value = 'bar';
		component.id = 1;

		assert.equal(count, 4);
		assert.htmlEqual(
			target.innerHTML,
			`
			<div>bar</div>
			<div>bar</div>
		`
		);
	}
});
