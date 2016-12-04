export default {
	html: '<div><p></p></div>',
	test ( assert, component, target ) {
		const widget = component.refs.widget;
		assert.equal( widget.get( 'show' ), false );
		widget.set({show: true});
		assert.equal( target.innerHTML, '<div><p>Hello<!--yield--><!--#if show--></p></div>' );
		component.set({data: 'World'});
		assert.equal( target.innerHTML, '<div><p>World<!--yield--><!--#if show--></p></div>' );
		widget.set({show: false});
		assert.equal( target.innerHTML, '<div><p><!--#if show--></p></div>' );
	}
}
