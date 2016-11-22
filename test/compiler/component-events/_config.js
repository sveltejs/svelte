export default {
	data: {
		visible: true
	},
	html: '<div><!--#if visible--><p>i am a widget</p></div>', // TODO comment should follow component...
	test ( assert, component ) {
		let count = 0;

		component.on( 'widgetTornDown', function () {
			assert.equal( this, component );
			count += 1;
		});

		component.set({ visible: false });
		assert.equal( count, 1 );

		component.set({ visible: true });
		component.set({ visible: false });
		assert.equal( count, 2 );
	}
};
