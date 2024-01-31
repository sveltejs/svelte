import { ok, test } from '../../test';

export default test({
	test({ assert, target, component }) {
		let svg = target.querySelector('svg');
		ok(svg);

		assert.equal(svg.namespaceURI, 'http://www.w3.org/2000/svg');
		assert.htmlEqual(
			svg.outerHTML,
			'<svg height="24" style="border:1px solid red;" width="24"><path d="M17 11h1a3 3 0 0 1 0 6h-1"></path><path d="M9 12v6"></path><path d="M13 12v6"></path><path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z"></path><path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8"></path></svg>'
		);
	}
});
