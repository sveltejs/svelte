export default {
	test({ assert, target }) {
		const svg = target.querySelector('svg');

		assert.equal(svg.childNodes.length, 2);
		assert.equal(svg.childNodes[0].nodeName, 'rect');
		assert.equal(svg.childNodes[1].nodeName, 'rect');
	}
};
