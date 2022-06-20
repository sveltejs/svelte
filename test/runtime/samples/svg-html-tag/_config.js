export default {
	html: `
			<svg width="100" height="60">
				<circle cx="25" cy="30" r="24" fill="#FFD166"></circle>
				<circle cx="75" cy="30" r="24" fill="#118AB2"></circle>
			</svg>
		`,
	test({ assert, target, component }) {

		let svg = target.querySelector('svg');
		let circles = target.querySelectorAll('circle');
		assert.equal(svg.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(2, circles.length);
		assert.equal(circles[0].namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(circles[1].namespaceURI, 'http://www.w3.org/2000/svg');

		component.width = 200;
		component.height = 120;
		assert.htmlEqual(
			target.innerHTML,
			`
			<svg width="200" height="120">
				<circle cx="50" cy="60" r="24" fill="#FFD166"></circle>
				<circle cx="150" cy="60" r="24" fill="#118AB2"></circle>
			</svg>
		`
		);
		svg = target.querySelector('svg');
		circles = target.querySelectorAll('circle');
		assert.equal(svg.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(2, circles.length);
		assert.equal(circles[0].namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(circles[1].namespaceURI, 'http://www.w3.org/2000/svg');
	}
};
