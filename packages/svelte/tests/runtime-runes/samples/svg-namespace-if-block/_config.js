import { test, ok } from '../../test';

export default test({
	html: `<svg height="200px" viewBox="0 0 100 100" width="200px"><g><rect fill="yellow" height="50" width="50" x="20" y="10"></rect></g></svg>`,
	test({ assert, target }) {
		const g = target.querySelector('g');
		const rect = target.querySelector('rect');
		ok(g);
		ok(rect);

		assert.equal(g.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(rect.namespaceURI, 'http://www.w3.org/2000/svg');
	}
});
