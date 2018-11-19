export default {
	html: '<div><p>i am a widget</p></div>',
	test ( assert, component ) {
		const widget = component.widget;
		assert.ok( widget.isWidget );
	}
};
