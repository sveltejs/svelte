export default {
	html: `
		default a
		<hr>
		<div slot="b">hello b</div>
	`,
	test({ assert, component, target }) {
		component.condition = true;
		assert.htmlEqual(target.innerHTML, `
			<div slot="a">hello a</div>
			<hr>
			<div slot="b">hello b</div>
		`);
	}
};
