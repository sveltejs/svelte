export default {
	test({ assert, target }) {
		const div = target.querySelector( 'div' );

		assert.equal( div.style.backgroundImage, 'url(https://example.com/foo.jpg)');
		assert.equal( div.style.color, 'red' );
	}
};
