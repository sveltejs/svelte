export default {
	html: `
		3 ~ 15
		<hr>
		<div>sum: 7 product: 2 all: 14</div>
	`,
	test({ assert, component, target }) {
		component.top = { a: 5, b: 6 };
		assert.htmlEqual(target.innerHTML, `
			11 ~ 55
			<hr>
			<div>sum: 7 product: 30 all: 42</div>
		`);

		component.main_constant = 3;
		assert.htmlEqual(target.innerHTML, `
			11 ~ 165
			<hr>
			<div>sum: 7 product: 90 all: 102</div>
		`);

		component.top = false;
		assert.htmlEqual(target.innerHTML, `
			<hr>
			<div>sum: 7 all: 12</div>
		`);

		component.bottom = false;
		assert.htmlEqual(target.innerHTML, `
			<hr>
			<div>35</div>
		`);

		component.top = { a: 2, b: 3 };
		assert.htmlEqual(target.innerHTML, `
			5 ~ 75
			<hr>
			<div>35</div>
		`);

		component.main_constant = 1;
		assert.htmlEqual(target.innerHTML, `
			5 ~ 25
			<hr>
			<div>15</div>
		`);
		
		component.foo_constant = 3;
		assert.htmlEqual(target.innerHTML, `
			5 ~ 15
			<hr>
			<div>9</div>
		`);
	}
};
