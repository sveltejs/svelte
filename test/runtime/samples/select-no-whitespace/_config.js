export default {
	test({ assert, target }) {
		const select = target.querySelector( 'select' );
		assert.equal( select.childNodes.length, 3 );
	}
};
