export default {
	dev: true,

	error ( assert, err ) {
		assert.equal( err.message, `Component was created without expected data property 'value'` );
	}
};