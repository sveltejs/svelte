// Hmm, another JSDOM quirk
export default {
	skip: true,

	html: `
		<svg>
			<g>
				<circle class='red'/>
			</g>
		</svg>
	`,

	test ( assert, component, target ) {
		const circle = target.querySelector( 'circle' );
		assert.equal( circle.getAttribute( 'class' ), 'red' );
		component.teardown();
	}
};
