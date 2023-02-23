export default {
	html: `
		x: fallback x
		y: <div slot="b">hello b</div>
	  z: fallback z
	`,
	test({ assert, component, target }) {
		component.condition = true;
		assert.htmlEqual(target.innerHTML, `
			x: <div slot="a">hello a</div>
			y: <div slot="b">hello b</div>
			z: fallback z
		`);
	}
};
