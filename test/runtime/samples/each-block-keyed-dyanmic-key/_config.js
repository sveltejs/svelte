let count = 0;
let value = 'foo';

export default {
	props: {
		value() {
			count++;
			return value;
		}
	},

	html: `
		<div>foo</div>
		<div>foo</div>
	`,

	test({ assert, component, target }) {
		value = 'bar';
		component.id = 1;

		assert.equal(count, 4);
		assert.htmlEqual(target.innerHTML, `
			<div>bar</div>
			<div>bar</div>
		`);
	}
};
