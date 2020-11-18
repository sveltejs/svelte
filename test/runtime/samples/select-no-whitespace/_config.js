export default {
	test({ assert, component, target }) {
		const select = target.querySelector( 'select' );
		assert.equal( select.childNodes.length, 3 );
	}
};
