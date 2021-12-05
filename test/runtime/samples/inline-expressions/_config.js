export default {
	props: {
		a: 1,
		b: 2
	},
	html: '<p>1 + 2 = 3</p>',
	test({ assert, component, target }) {
		component.a = 3;
		component.b = 4;
		assert.equal( target.innerHTML, '<p>3 + 4 = 7</p>' );
	}
};
