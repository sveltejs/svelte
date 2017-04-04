export default {
	dev: true,

	error ( assert, err ) {
		assert.equal( err.message, `The first argument to component.observe(...) must be the name of a top-level property, i.e. 'nested' rather than 'nested.data'` );
	}
};