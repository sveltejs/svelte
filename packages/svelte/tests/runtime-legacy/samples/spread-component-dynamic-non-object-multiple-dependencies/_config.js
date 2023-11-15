import { test } from '../../test';

export default test({
	get props() {
		return { props: { foo: 'lol', baz: 40 + 2 } };
	},

	html: `
		<div><p>foo: lol</p>
		<p>baz: 42</p>
		<p>qux: named</p>
		<p>corge: b</p>
	`,

	test({ assert, component, target }) {
		const html = `
			<div><p>foo: </p>
			<p>baz: </p>
			<p>qux: named</p>
			<p>corge: b</p>
		`;

		// test undefined
		// @ts-ignore
		component.props = undefined;
		assert.htmlEqual(target.innerHTML, html);

		// set object props
		// @ts-ignore
		component.props = this.props.props;
		// @ts-ignore
		assert.htmlEqual(target.innerHTML, this.html);

		// test null
		// @ts-ignore
		component.props = null;
		assert.htmlEqual(target.innerHTML, html);

		// set object props
		// @ts-ignore
		component.props = this.props.props;
		// @ts-ignore
		assert.htmlEqual(target.innerHTML, this.html);

		// test boolean
		// @ts-ignore
		component.props = true;
		assert.htmlEqual(target.innerHTML, html);

		// set object props
		// @ts-ignore
		component.props = this.props.props;
		// @ts-ignore
		assert.htmlEqual(target.innerHTML, this.html);

		// test number
		// @ts-ignore
		component.props = 123;
		assert.htmlEqual(target.innerHTML, html);
	}
});
