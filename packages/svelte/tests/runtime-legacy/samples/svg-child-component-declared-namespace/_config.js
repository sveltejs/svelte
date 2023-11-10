import { ok, test } from '../../test';

export default test({
	get props() {
		return { x: 0, y: 0, width: 100, height: 100 };
	},

	html: '<svg><rect x="0" y="0" width="100" height="100"></rect></svg>',

	test({ assert, component, target }) {
		const svg = target.querySelector('svg');
		const rect = target.querySelector('rect');
		ok(svg);
		ok(rect);

		assert.equal(svg.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.equal(rect.namespaceURI, 'http://www.w3.org/2000/svg');

		component.width = 150;
		component.height = 50;
		assert.htmlEqual(
			target.innerHTML,
			'<svg><rect x="0" y="0" width="150" height="50"></rect></svg>'
		);
	}
});
