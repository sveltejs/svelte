export default {
	html: '<p>2</p>',

	'skip-ssr': /^v4/.test( process.version ), // we're not transpiling server-side tests in Node 4, because it's tricky

	test ( assert, component, target ) {
		component.set({ a: 2 });
		assert.equal( target.innerHTML, '<p>4</p>' );
		component.destroy();
	}
};
