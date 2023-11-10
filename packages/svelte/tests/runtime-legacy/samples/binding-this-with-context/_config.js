import { test } from '../../test';

export default test({
	html: `<div>foo</div><div>bar</div><div>baz</div>
	<span>foo</span><span>bar</span><span>baz</span>
	<ul><li><p>foo</p></li><li><p>bar</p></li><li><p>baz</p></li></ul>
	<ul><li><hr /></li><li><hr /></li><li><hr /></li></ul>`,

	test({ assert, component, target }) {
		let divs = target.querySelectorAll('div');
		assert.equal(component.divs.length, 3, 'three divs are registered (unkeyed array)');
		// @ts-ignore
		component.divs.forEach((e, i) => {
			assert.equal(e, divs[i], `div ${i} is correct (unkeyed array)`);
		});

		let spans = target.querySelectorAll('span');
		assert.equal(
			Object.keys(component.spans).length,
			3,
			'three spans are registered (unkeyed object)'
		);
		// @ts-ignore
		component.items.forEach((e, i) => {
			assert.equal(
				component.spans[`-${e}${i}`],
				spans[i],
				`span -${e}${i} is correct (unkeyed object)`
			);
		});

		let ps = target.querySelectorAll('p');
		assert.equal(component.ps.length, 3, 'three ps are registered (keyed array)');
		// @ts-ignore
		component.ps.forEach((e, i) => {
			assert.equal(e, ps[i], `p ${i} is correct (keyed array)`);
		});

		let hrs = target.querySelectorAll('hr');
		assert.equal(Object.keys(component.hrs).length, 3, 'three hrs are registered (keyed object)');
		// @ts-ignore
		component.items.forEach((e, i) => {
			assert.equal(component.hrs[e], hrs[i], `hr ${e} is correct (keyed object)`);
		});

		component.items = ['foo', 'baz'];
		assert.equal(component.divs.length, 3, 'the divs array is still 3 long');
		assert.equal(component.divs[2], null, 'the last div is unregistered');
		// Different from Svelte 3
		assert.equal(component.ps[1], null, 'the second p is unregistered');
		// Different from Svelte 3
		assert.equal(component.spans['-baz2'], null, 'the baz span is unregistered');
		assert.equal(component.hrs.bar, null, 'the bar hr is unregistered');

		divs = target.querySelectorAll('div');
		// @ts-ignore
		component.divs.forEach((e, i) => {
			assert.equal(e, divs[i], `div ${i} is still correct`);
		});

		// TODO: unsure if need these two tests to pass, as the logic between Svelte 3
		// and Svelte 5 is different for these cases.

		// elems = target.querySelectorAll('span');
		// component.items.forEach((e, i) => {
		//   assert.equal(
		//     component.spans[`-${e}${i}`],
		//     elems[i],
		//     `span -${e}${i} is still correct`,
		//   );
		// });

		// elems = target.querySelectorAll('p');
		// component.ps.forEach((e, i) => {
		//   assert.equal(e, elems[i], `p ${i} is still correct`);
		// });

		hrs = target.querySelectorAll('hr');
		// @ts-ignore
		component.items.forEach((e, i) => {
			assert.equal(component.hrs[e], hrs[i], `hr ${e} is still correct`);
		});
	}
});
