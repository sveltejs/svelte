export default {
	compileError: function ( assert, err ) {
		assert.equal('Error: Only one {{yield}} per component.', err)
	}
};
