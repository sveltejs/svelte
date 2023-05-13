export default {
	skip_if_ssr: true,
	props: {
		tag: 'my-custom-element',
		name: null
	},
	html: `
		<my-custom-element id="a">Hello null!</my-custom-element>
		<my-custom-element id="b">Hello null!</my-custom-element>
	`,

	test({ assert, component, target }) {
		component.name = undefined;
		assert.htmlEqual(
			target.innerHTML,
			`<my-custom-element id="a">Hello undefined!</my-custom-element>
			 <my-custom-element id="b">Hello undefined!</my-custom-element>`
		);

		component.name = 'foo';
		assert.htmlEqual(
			target.innerHTML,
			`<my-custom-element id="a">Hello foo!</my-custom-element>
			 <my-custom-element id="b">Hello foo!</my-custom-element>`
		);

		component.tag = null;
		assert.htmlEqual(target.innerHTML, '<my-custom-element id="b">Hello foo!</my-custom-element>');

		component.tag = 'div';
		assert.htmlEqual(
			target.innerHTML,
			`<div name="foo" id="a"></div>
			 <my-custom-element id="b">Hello foo!</my-custom-element>`
		);

		component.tag = 'my-custom-element';
		assert.htmlEqual(
			target.innerHTML,
			`<my-custom-element id="a">Hello foo!</my-custom-element>
			 <my-custom-element id="b">Hello foo!</my-custom-element>`
		);
	}
};
