let a = true;
let count_a = 0;
let count_b = 0;

export default {
	props: {
		foo: 'potato',
		fn: () => {
			count_a += 1;
			return a;
		},
		other_fn: () => {
			count_b += 1;
			return true;
		}
	},

	html: `<p>potato</p>`,

	test({ assert, component, target }) {
		assert.equal(count_a, 1);
		assert.equal(count_b, 0);

		a = false;
		component.foo = 'soup';
		assert.equal(count_a, 1);
		assert.equal(count_b, 1);

		assert.htmlEqual(target.innerHTML, `<p>soup</p>`);

		component.foo = 'salad';
		assert.equal(count_a, 1);
		assert.equal(count_b, 1);

		assert.htmlEqual(target.innerHTML, `<p>salad</p>`);
	}
}