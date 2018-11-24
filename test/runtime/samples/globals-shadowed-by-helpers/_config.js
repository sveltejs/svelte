export default {
	props: {
		x: 10
	},

	html: 'potato',

	test({ assert, component, target }) {
		component.x = 3;
		assert.htmlEqual( target.innerHTML, 'potato' );
	}
};
