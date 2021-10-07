export default {
	html: `
		<svg>
			<g>
				<circle class='red'/>
			</g>
		</svg>
	`,

	test({ assert, target }) {
		const circle = target.querySelector('circle');
		assert.equal(circle.getAttribute('class'), 'red');
	}
};
