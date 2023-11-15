import { ok, test } from '../../test';

export default test({
	test({ assert, target }) {
		const svg = target.querySelector('svg');
		ok(svg);

		assert.equal(svg.childNodes.length, 2);
		assert.equal(svg.childNodes[0].nodeName, 'rect');
		assert.equal(svg.childNodes[1].nodeName, 'rect');
	}
});
