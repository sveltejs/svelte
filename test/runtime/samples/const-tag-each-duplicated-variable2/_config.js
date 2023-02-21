export default {
	html: `
	    <p>foo: dummy-foo, num: dummy-num</p>
		  <p>bar: 1,2,3,2,, num: 1</p>
			<p>bar: 1,2,3,2,, num: 2</p>
			<p>bar: 1,2,3,2,, num: 3</p>
	`,
	async test({ component, target, assert }) {
		assert.htmlEqual(
			target.innerHTML,
			`
			  <p>foo: dummy-foo, num: dummy-num</p>
			  <p>bar: 1,2,3,2,, num: 1</p>
				<p>bar: 1,2,3,2,, num: 2</p>
				<p>bar: 1,2,3,2,, num: 3</p>
			`
		);

		component.nums = [1, 2, 3, 4];

		assert.htmlEqual(
			target.innerHTML,
			`
			  <p>foo: dummy-foo, num: dummy-num</p>
				<p>bar: 1,2,3,2,4,, num: 1</p>
				<p>bar: 1,2,3,2,4,, num: 2</p>
				<p>bar: 1,2,3,2,4,, num: 3</p>
				<p>bar: 1,2,3,2,4,, num: 4</p>
		`
		);
	}
};
