export default {
	'skip-ssr': true, // uses oncreate

	html: `
		<p>1</p>
		<p>2</p>
	`,

	test ( assert, component, target ) {
		component.set({ foo: 2 });
		assert.htmlEqual( target.innerHTML, `
			<p>2</p>
			<p>4</p>
		` );
	}
};
