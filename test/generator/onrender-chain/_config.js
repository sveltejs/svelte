export default {
	'skip-ssr': true,

	html: `
		<span>3</span><span>2</span><span>1</span>
	`,

	test ( assert, component, target ) {
		component.refs.list.update();

		assert.htmlEqual( target.innerHTML, `
			<span>1</span><span>2</span><span>3</span><span>4</span><span>5</span>
		` );

		component.teardown();
	}
};
