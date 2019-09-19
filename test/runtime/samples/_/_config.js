export default {
	html: `<div>foo</div><div>bar</div><div>baz</div>`,

	test({ assert, component, target }) {
		let elems = target.querySelectorAll('div');
		assert.equal(component.divs.length, 3, 'three divs are registered (unkeyed array)');
		component.divs.forEach((e, i) => {
			assert.equal(e, elems[i], `div ${i} is correct (unkeyed array)`);
		});

		component.items = ['foo', 'baz'];
		assert.equal(component.divs.length, 3, 'the divs array is still 3 long');
		assert.equal(component.divs[2], null, 'the last div is unregistered');

		elems = target.querySelectorAll('div');
		component.divs.forEach((e, i) => {
			assert.equal(e, elems[i], `div ${i} is still correct`);
		});
	}
};
