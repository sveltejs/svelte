export default {
	html: `<div>hello&nbsp;</div>`,

	test({ assert, component, target }) {
		const text = target.querySelector( 'div' ).textContent;
		assert.equal( text.charCodeAt( 5 ), 160 );
	}
};