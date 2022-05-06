export default {
	html: `
		<svg>
			<circle cx='0' cy='100' r='100' fill='red'/><circle cx='100' cy='100' r='100' fill='green'/><circle cx='200' cy='100' r='100' fill='blue'/>
		</svg>
	`,

	test({ assert, target }) {
		const circles = target.querySelectorAll('circle');
		assert.equal(circles[0].namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(circles[1].namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(circles[2].namespaceURI, 'http://www.w3.org/2000/svg');
	}
};
