export default {
	html: '<main><div class="sidebar-widget">Hello Hello</div></main>',
	test ( assert, component, target ) {
		component.set({ a: 'World' });
		assert.equal( component.get( 'a' ), 'World' );
		assert.equal( target.innerHTML, '<main><div class="sidebar-widget">Hello World</div></main>' );
	}
};
