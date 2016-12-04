export default {
	skip: true,
	data: {
		visible: true
	},
	html: 'before\n<p>Widget</p><!--#if visible-->\nafter',
	test ( assert, component, target ) {
		component.set({ visible: false });
		assert.equal( target.innerHTML, 'before\n<!--#if visible-->\nafter' );
		component.set({ visible: true });
		assert.equal( target.innerHTML, 'before\n<p>Widget</p><!--#if visible-->\nafter' );
	}
};
