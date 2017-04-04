export default {
	data: {
		visible: true
	},
	html: 'before\n<p>Widget</p><!---->\nafter',
	test ( assert, component, target ) {
		component.set({ visible: false });
		assert.equal( target.innerHTML, 'before\n<!---->\nafter' );
		component.set({ visible: true });
		assert.equal( target.innerHTML, 'before\n<p>Widget</p><!---->\nafter' );
	}
};
