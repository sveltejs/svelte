export default {
	data: {
		visible: true
	},
	html: '<p>i am visible</p><!---->',
	test ( assert, component, target ) {
		component.set({ visible: false });
		assert.equal( target.innerHTML, '<!---->' );
		component.set({ visible: true });
		assert.equal( target.innerHTML, '<p>i am visible</p><!---->' );
	}
};
