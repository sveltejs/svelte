export default {
	html: '<span>&nbsp;</span>',

	test({ assert, component, target }) {
		const text = target.querySelector( 'span' ).textContent;
		assert.equal( text.charCodeAt( 0 ), 160 );
	}
};
