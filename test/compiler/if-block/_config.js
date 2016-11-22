export default {
	data: {
		visible: true
	},
	html: '<p>i am visible</p><!--#if visible-->',
	test ( assert, component, target ) {
		component.set({ visible: false });
		assert.equal( target.innerHTML, '<!--#if visible-->' );
		component.set({ visible: true });
		assert.equal( target.innerHTML, '<p>i am visible</p><!--#if visible-->' );
	}
};
