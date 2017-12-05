export default {
	data: {
		x: true
	},

	html: `
		<h1>Foo</h1>
		<div slot='other'>what goes up must come down</div>
		<p>element</p>
		you're it
		<p>neither foo nor bar</p>
		text
		<span>a</span>
		<span>b</span>
		<span>c</span>
		<div>baz</div>
	`,

	test(assert, component, target) {
		component.set({
			x: false
		});

		assert.htmlEqual(target.innerHTML, `
			<h1>Bar</h1>
			<p>element</p>
			you're it
			<p>neither foo nor bar</p>
			text
			<span>a</span>
			<span>b</span>
			<span>c</span>
			<div>baz</div>
			<div slot='other'>what goes up must come down</div>
		`);
	}
};