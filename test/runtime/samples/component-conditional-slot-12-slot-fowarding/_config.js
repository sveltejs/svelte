export default {
	html: `
		x: Fallback a
		y: fallback y
		z: <div slot="c">hello c</div>
	`,
	test({ assert, component, target }) {
		component.condition1 = true;
		assert.htmlEqual(target.innerHTML, `
			x: Fallback a
			y: <div slot="b">hello b</div>
			z: <div slot="c">hello c</div>
		`);

		component.condition3 = true;
		assert.htmlEqual(target.innerHTML, `
			x: <div slot="a">hello a</div>
			y: <div slot="b">hello b</div>
			z: <div slot="c">hello c</div>
		`);

		component.condition4 = false;
		component.condition1 = false;
		assert.htmlEqual(target.innerHTML, `
			x: <div slot="a">hello a</div>
			y: fallback y
			z: <div slot="c">hello c</div>
		`);

		component.condition2 = false;
		assert.htmlEqual(target.innerHTML, `
			x: <div slot="a">hello a</div>
			y: fallback y
			z: fallback z
		`);
	}
};
