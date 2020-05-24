export default {
	props: {
		props: {
			foo: 'lol',
			baz: 40 + 2,
		}
	},

	html: `
		<div baz="42" foo="lol" qux="named"></div>
	`,

	test({ assert, component, target }) {
		const html = `
			<div qux="named"></div>
		`;

		// test undefined
		component.props = undefined;
		assert.htmlEqual(target.innerHTML, html);

		// set object props
		component.props = this.props.props;
		assert.htmlEqual(target.innerHTML, this.html);

		// test null
		component.props = null;
		assert.htmlEqual(target.innerHTML, html);

		// set object props
		component.props = this.props.props;
		assert.htmlEqual(target.innerHTML, this.html);

		// test boolean
		component.props = true;
		assert.htmlEqual(target.innerHTML, html);

		// set object props
		component.props = this.props.props;
		assert.htmlEqual(target.innerHTML, this.html);

		// test number
		component.props = 123;
		assert.htmlEqual(target.innerHTML, html);

	}
};
