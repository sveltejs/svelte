export default {
	props: { foo: 'bar' },

	html: `
		<svg>
			<use xlink:href="#bar"/>
		</svg>
	`,

	test({ assert, component, target }) {
		const use = target.querySelector( 'use' );
		assert.equal( use.getAttributeNS( 'http://www.w3.org/1999/xlink', 'href' ), '#bar' );
	}
};