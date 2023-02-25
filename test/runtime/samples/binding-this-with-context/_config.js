export default {
	html: `<div>foo</div><div>bar</div><div>baz</div>
	<span>foo</span><span>bar</span><span>baz</span>
	<ul><li><p>foo</p></li><li><p>bar</p></li><li><p>baz</p></li></ul>
	<ul><li><hr /></li><li><hr /></li><li><hr /></li></ul>`,

	test({ assert, component, target }) {
		let elems = target.querySelectorAll('div');
		assert.equal(component.divs.length, 3, 'three divs are registered (unkeyed array)');
		component.divs.forEach((e, i) => {
			assert.equal(e, elems[i], `div ${i} is correct (unkeyed array)`);
		});

		elems = target.querySelectorAll('span');
		assert.equal(Object.keys(component.spans).length, 3, 'three spans are registered (unkeyed object)');
		component.items.forEach((e, i) => {
			assert.equal(component.spans[`-${e}${i}`], elems[i], `span -${e}${i} is correct (unkeyed object)`);
		});

		elems = target.querySelectorAll('p');
		assert.equal(component.ps.length, 3, 'three ps are registered (keyed array)');
		component.ps.forEach((e, i) => {
			assert.equal(e, elems[i], `p ${i} is correct (keyed array)`);
		});

		elems = target.querySelectorAll('hr');
		assert.equal(Object.keys(component.hrs).length, 3, 'three hrs are registered (keyed object)');
		component.items.forEach((e, i) => {
			assert.equal(component.hrs[e], elems[i], `hr ${e} is correct (keyed object)`);
		});

		component.items = ['foo', 'baz'];
		assert.equal(component.divs.length, 3, 'the divs array is still 3 long');
		assert.equal(component.divs[2], null, 'the last div is unregistered');
		assert.equal(component.ps[2], null, 'the last p is unregistered');
		assert.equal(component.spans['-bar1'], null, 'the bar span is unregistered');
		assert.equal(component.hrs.bar, null, 'the bar hr is unregistered');

		elems = target.querySelectorAll('div');
		component.divs.forEach((e, i) => {
			assert.equal(e, elems[i], `div ${i} is still correct`);
		});

		elems = target.querySelectorAll('span');
		component.items.forEach((e, i) => {
			assert.equal(component.spans[`-${e}${i}`], elems[i], `span -${e}${i} is still correct`);
		});

		elems = target.querySelectorAll('p');
		component.ps.forEach((e, i) => {
			assert.equal(e, elems[i], `p ${i} is still correct`);
		});

		elems = target.querySelectorAll('hr');
		component.items.forEach((e, i) => {
			assert.equal(component.hrs[e], elems[i], `hr ${e} is still correct`);
		});
	}
};
