export default {
	props: {
		visible: true
	},

	html: '<div><p>i am a widget</p></div>',

	test({ assert, component }) {
		let count = 0;

		component.$on('widgetTornDown', function() {
			assert.equal(this, component);
			count += 1;
		});

		component.visible = false;
		assert.equal(count, 1);

		component.visible = true;
		component.visible = false;
		assert.equal(count, 2);
	}
};
