export default {
	skip_if_ssr: true,

	props: {
		x: 0,
		y: 0,
		width: 100,
		height: 100
	},

	html: '<svg xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="100" height="100"></rect></svg>',

	test({ assert, component, target }) {
		const svg = target.querySelector( 'svg' );
		const rect = target.querySelector( 'rect' );

		assert.equal( svg.namespaceURI, 'http://www.w3.org/2000/svg' );
		assert.equal( rect.namespaceURI, 'http://www.w3.org/2000/svg' );

		component.width = 150;
		component.height = 50;
		assert.equal( target.innerHTML, '<svg xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="150" height="50"></rect></svg>' );
	}
};
