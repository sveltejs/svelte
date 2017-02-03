export default {
	'skip-ssr': true, // TODO delete this line, once binding works

	html: `
		<p>y: foo</p>
		<p>y: foo</p>
	`,

	test ( assert, component, target ) {
		component.set({ x: false });

		assert.htmlEqual( target.innerHTML, `
			<p>y: foo</p>
			<p>y: foo</p>
		` );
	}
};
