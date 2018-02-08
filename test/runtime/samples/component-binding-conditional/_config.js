export default {
	'skip-ssr': true, // TODO delete this line, once binding works

	html: `
		<p>y: bar</p>
		<p>y: bar</p>
	`,

	test ( assert, component, target ) {
		component.set({ x: false });

		assert.htmlEqual( target.innerHTML, `
			<p>y: bar</p>
			<p>y: bar</p>
		` );
	}
};
