export default {
	allowES2015: true,

	data: {
		numbers: [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
	},

	html: '1, 3, 5, 7, 9',

	test ( assert, component, target ) {
		component.set({
			numbers: [ 10, 11, 12, 13, 14, 15, 16 ]
		});

		assert.htmlEqual( target.innerHTML, `11, 13, 15` );

		component.destroy();
	}
};