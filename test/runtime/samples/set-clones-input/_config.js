export default {
	dev: true,

	data: {
		a: 42
	},

	test ( assert, component ) {
		const obj = { a: 1 };
		component.set( obj );
		component.set( obj ); // will fail if the object is not cloned
		component.destroy();
	}
};